import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

const defaultOptions = {
  isEqual: (a, b) => a === b,
};
/*
 * Adds controllable props (and their default control functions) to a component
 *
 * @param initialState { [propName]: [initialValue] }
 * @param mapControllersToState { [controllerPropName]: [anything setState can consume] }
 */
export function controllable(
  initialState,
  mapControllersToState,
  { isEqual } = defaultOptions
) {
  const controlledPropNames = Object.keys(initialState);
  const controllerPropNames = Object.keys(mapControllersToState);

  // a map of controlled props to their respective notifier propname, e.g. { foo: onFooDidChange }
  const notifierPropNamesByControlledProp = controlledPropNames.reduce(
    (notifierPropNameMap, controlledPropName) => ({
      ...notifierPropNameMap,
      [controlledPropName]: `on${controlledPropName.replace(
        /^(\w)/,
        (_, firstCharacter) => firstCharacter.toUpperCase()
      )}DidChange`,
    }),
    {}
  );

  return Component => {
    class ControlledComponent extends React.Component {
      constructor(props) {
        super(props);
        this.state = controlledPropNames.reduce(
          (state, propName) => ({
            ...state,
            [propName]:
              props[propName] === undefined
                ? initialState[propName]
                : props[propName],
          }),
          {}
        );
        this.controllers = controllerPropNames.reduce(
          (controllers, propName) => ({
            ...controllers,
            [propName]: () => this.setState(mapControllersToState[propName]),
          }),
          {}
        );
      }

      componentDidUpdate(prevProps, prevState) {
        Object.keys(prevState).forEach(cp => {
          const oldValue = prevState[cp];
          const newValue = this.state[cp];
          if (
            !isEqual(oldValue, newValue) &&
            typeof this.props[notifierPropNamesByControlledProp[cp]] ===
              'function'
          ) {
            // call notifier (e.g. onFooDidChange) with the new and old value for its controlled prop
            this.props[notifierPropNamesByControlledProp[cp]](
              newValue,
              oldValue
            );
          }
        });
      }

      static getDerivedStateFromProps(nextProps, prevState) {
        if (
          controlledPropNames.every(
            cp =>
              nextProps[cp] === undefined ||
              isEqual(nextProps[cp], prevState[cp])
          )
        ) {
          return null;
        }
        // combine changed (controlled) props into the next state object
        return controlledPropNames.reduce(
          (nextState, cp) =>
            nextProps[cp] !== undefined &&
            !isEqual(nextProps[cp], prevState[cp])
              ? { ...nextState, [cp]: nextProps[cp] }
              : nextState,
          {}
        );
      }

      render() {
        /* notifier props (e.g. onFooDidChange) that are passed into this enhanced component
           are handled here; they should NOT be passed along to the underlying component. All
           other props should be passed through, possibly overwriting the internally-controlled
           props (passed by `{...this.state}`) and their controllers. */
        const nonNotifierProps = Object.keys(this.props)
          .filter(
            prop =>
              !Object.prototype.hasOwnProperty.call(
                notifierPropNamesByControlledProp,
                prop
              )
          )
          .reduce(
            (props, prop) => ({ ...props, [prop]: this.props[prop] }),
            {}
          );

        return (
          <Component
            {...this.state}
            {...this.controllers}
            {...nonNotifierProps}
          />
        );
      }
    }

    ControlledComponent.displayName = `Controlled(${Component.displayName ||
      Component.name ||
      'Component'})`;

    return hoistNonReactStatics(ControlledComponent, Component);
  };
}
