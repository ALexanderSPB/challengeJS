const scopeStorage = new Map();

function getScopeFor(ast, outerScope) {
    if (!scopeStorage.has(ast)) {
        scopeStorage.set(ast, new Scope(ast, outerScope))
    }

    return scopeStorage.get(ast)
}

/**
 * Функция обхода дерева. Выполняет обход дерева в глубину,
 * передавая в callback-функции onNodeEnter (до посещения потомков)
 * и onNodeLeave (после посещения потомков) каждый узел дерева
 * и текущую область видимости (смотри определение Scope ниже).
 *
 * @param      {object}    ast                              Исходное ast.
 * @param      {Function}  [onNodeEnter=(node, scope)=>{}]  Вызывается для каждого узла до посещения потомков.
 * @param      {Function}  [onNodeLeave=(node, scope)=>{}]  Вызывается для каждого узла после посещения потомков.
 */
function traverse(
    ast,
    onNodeEnter = (node, scope) => { },
    onNodeLeave = (node, scope) => { }
) {
    const rootScope = getScopeFor(ast);

    _inner(ast, rootScope);

    /**
     * Определение области видимости узла.
     * Может либо вернуть текущий scope, либо создать новый.
     *
     * @param      {object}  astNode       ast-узел.
     * @param      {Scope}   currentScope  Текущая область видимости.
     * @return     {Scope}   Область видимости для внутренних узлов astNode.
     */
    function resolveScope(astNode, currentScope) {
        let isFunctionExpression = ast.type === 'FunctionExpression',
            isFunctionDeclaration = ast.type === 'FunctionDeclaration';

        if (!isFunctionExpression &&
            !isFunctionDeclaration) {
            // Новые области видимости порождают только функции.
            return currentScope;
        }

        // Каждая функция порождает новую область видимости.
        const newScope = getScopeFor(ast, currentScope);

        ast.params.forEach(param => {
            // Параметры функции доступны внутри функции.
            newScope.add(param.name, param);
        });

        if (isFunctionDeclaration) {
            // Имя функции при декларации доступно снаружи функции.
            currentScope.add(ast.id.name, ast);
        } else {
            // Имя функции-выражения доступно только внутри неё.
            newScope.add(ast.id.name, ast);
        }

        return newScope;
    }

    /**
     * Рекурсивная функция обхода ast.
     *
     * @param      {object}  astNode  Текущий ast-узел.
     * @param      {Scope}  scope     Область видимости для текущего ast-узла.
     */
    function _inner(astNode, scope, parent) {
        if (Array.isArray(astNode)) {
            astNode.forEach(node => {
                /* Рекурсивный обход элементов списков.
                 * Списками являются, например, параметры функций.
                 */
                _inner(node, scope, parent);
            });
        } else if (astNode && typeof astNode === 'object') {
            onNodeEnter(astNode, scope, parent);

            const innerScope = resolveScope(astNode, scope),
                keys = Object.keys(astNode).filter(key => {
                    // loc - служебное свойство, а не ast-узел.
                    return key !== 'loc' &&
                        astNode[key] && typeof astNode[key] === 'object';
                });

            keys.forEach(key => {
                // Обход всех потомков.
                _inner(astNode[key], innerScope, astNode);
            });

            onNodeLeave(astNode, scope, parent);
        }
    }
}

/**
 * Представление области видимости.
 *
 * @class      Scope (name)
 * @param      {object}  astNode      ast-узел, породивший эту область видимости.
 * @param      {object}  parentScope  Родительская область видимости.
 */
function Scope(astNode, parentScope) {
    this._node = astNode;
    this._parent = parentScope;
    this._vars = new Map();
}

Scope.prototype = {
    /**
     * Добавление имени переменной в область видимости.
     *
     * @param      {string}  name    Имя переменной.
     */
    add(name, value) {
        this._vars.set(name, {
            value: value,
            scope: this
        });
    },
    resolve(node) {
        if (!node) {
            return node
        }
        if (node.type !== 'Identifier') {
            let value = this._vars.get(node.param);
            if (!value) {
                if (this._parent) {
                    value = this._parent.resolve(node);
                } else {
                    this.add(node.param, node);
                    return this.resolve(node)
                }
            }
            if (!value) {
                return;
            }
            if (value.type === 'Identifier' &&
                value.value !== node) {
                return value.scope.resolve(value.value) || value;
            }
            return value;
        }
    },
    /**
     * Была ли определена переменная с таким именем.
     *
     * @param      {string}   name    Имя переменной.
     * @return     {boolean}  Встречалась ли переменная с таким именем в доступных областях видимости.
     */
    isDefined(name) {
        return this._vars.has(name) || (this._parent && this._parent.isDefined(name));
    }
};

function getPropName(node, scope) {
    let prop = node.property;
    if (!node.computed) {
        return prop.name;
    }
    let resolved = scope.resolve(prop);
    if (resolved) {
        prop = resolved.value;
    }
    if (prop.type === 'StringLiteral') {
        return prop.value;
    }

}



function solve(ast) {
    const result = [];

    traverse(ast, (node, scope) => {
        if (node.type === 'VariableDeclarator') {
            scope.add(node.id.name, node.init)
        }
    })

    let rootScope = getScopeFor(ast)

    traverse(ast, (node, scope, parent) => {
        if (node.type !== 'CallExpression') {
            return;
        }
        let args = node.arguments;
        if (args.length !== 1 ||
            args[0].type !== 'FunctionExpression') {
            return;
        }
        let callee = node.callee;

        let resolved = scope.resolve(callee);
        if (resolved) {
            callee = resolved.value;
            scope = resolved.scope;
        }

        if (callee.type !== 'MemberExpression') {
            return;
        }
        let property = getPropName(callee, scope),
            object = callee.object;
        if (property !== 'n') {
            return;
        }
        resolved = scope.resolve(object);
        if (resolved) {
            object = resolved.object;
            scope = resolved.scope;
        }
        if (object.type !== 'MemberExpression') {
            return;
        }
        property = getPropName(object, scope);

        object = object.object;
        if (property !== 'y') {
            return;
        }
        resolved = scope.resolve(object);
        let zScope;
        if (resolved) {
            object = resolved.object;
            zScope = resolved.scope;
        }
        if (object.type !== 'Identifier' || object.name !== 'Z') {
            return;
        }
        if (zScope && zScope !== rootScope) {
            return;
        }

        checkFunction(args[0])
    });

    function checkFunction(ast) {
        let firstArg = ast.params[0];
        if (!firstArg) {
            return;
        }

        traverse(ast, (node, scope, parent) => {
            if (parent === ast) {
                return;
            }
            if (!parent) {
                return;
            }
            if (parent.type === 'MemberExpression' &&
                parent.computed === false &&
                parent.property === node) {
                return;
            }
            if (parent.type === 'ObjectProperty' &&
                parent.key === node) {
                return;
            }
            if (node.type !== 'Identifier') {
                return;
            }
            let resolved = scope.resolve(node);
            if (resolved && resolved.value === firstArg) {
                result.push(node);
            }
        })
    }

    return result;
}