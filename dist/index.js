"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.controllable = controllable;

var _react = _interopRequireDefault(require("react"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultOptions = {
  isEqual: function isEqual(a, b) {
    return a === b;
  }
};
/*
 * Adds controllable props (and their default control functions) to a component
 *
 * @param initialState { [propName]: [initialValue] }
 * @param mapControllersToState { [controllerPropName]: [anything setState can consume] }
 */

function controllable(initialState, mapControllersToState) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultOptions,
      isEqual = _ref.isEqual;

  var controlledPropNames = Object.keys(initialState);
  var controllerPropNames = Object.keys(mapControllersToState); // a map of controlled props to their respective notifier propname, e.g. { foo: onFooDidChange }

  var notifierPropNamesByControlledProp = controlledPropNames.reduce(function (notifierPropNameMap, controlledPropName) {
    return _objectSpread({}, notifierPropNameMap, _defineProperty({}, controlledPropName, "on".concat(controlledPropName.replace(/^(\w)/, function (_, firstCharacter) {
      return firstCharacter.toUpperCase();
    }), "DidChange")));
  }, {});
  return function (Component) {
    var ControlledComponent =
    /*#__PURE__*/
    function (_React$Component) {
      _inherits(ControlledComponent, _React$Component);

      function ControlledComponent(props) {
        var _this;

        _classCallCheck(this, ControlledComponent);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(ControlledComponent).call(this, props));
        _this.state = controlledPropNames.reduce(function (state, propName) {
          return _objectSpread({}, state, _defineProperty({}, propName, props[propName] === undefined ? initialState[propName] : props[propName]));
        }, {});
        _this.controllers = controllerPropNames.reduce(function (controllers, propName) {
          return _objectSpread({}, controllers, _defineProperty({}, propName, function () {
            return _this.setState(mapControllersToState[propName]);
          }));
        }, {});
        return _this;
      }

      _createClass(ControlledComponent, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
          var _this2 = this;

          Object.keys(prevState).forEach(function (cp) {
            var oldValue = prevState[cp];
            var newValue = _this2.state[cp];

            if (!isEqual(oldValue, newValue) && typeof _this2.props[notifierPropNamesByControlledProp[cp]] === 'function') {
              // call notifier (e.g. onFooDidChange) with the new and old value for its controlled prop
              _this2.props[notifierPropNamesByControlledProp[cp]](newValue, oldValue);
            }
          });
        }
      }, {
        key: "render",
        value: function render() {
          var _this3 = this;

          /* notifier props (e.g. onFooDidChange) that are passed into this enhanced component
             are handled here; they should NOT be passed along to the underlying component. All
             other props should be passed through, possibly overwriting the internally-controlled
             props (passed by `{...this.state}`) and their controllers. */
          var nonNotifierProps = Object.keys(this.props).filter(function (prop) {
            return !Object.prototype.hasOwnProperty.call(notifierPropNamesByControlledProp, prop);
          }).reduce(function (props, prop) {
            return _objectSpread({}, props, _defineProperty({}, prop, _this3.props[prop]));
          }, {});
          return _react.default.createElement(Component, _extends({}, this.state, this.controllers, nonNotifierProps));
        }
      }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
          if (controlledPropNames.every(function (cp) {
            return nextProps[cp] === undefined || isEqual(nextProps[cp], prevState[cp]);
          })) {
            return null;
          } // combine changed (controlled) props into the next state object


          return controlledPropNames.reduce(function (nextState, cp) {
            return nextProps[cp] !== undefined && !isEqual(nextProps[cp], prevState[cp]) ? _objectSpread({}, nextState, _defineProperty({}, cp, nextProps[cp])) : nextState;
          }, {});
        }
      }]);

      return ControlledComponent;
    }(_react.default.Component);

    ControlledComponent.displayName = "Controlled(".concat(Component.displayName || Component.name || 'Component', ")");
    return (0, _hoistNonReactStatics.default)(ControlledComponent, Component);
  };
}