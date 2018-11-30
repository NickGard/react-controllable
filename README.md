# react-controllable

A higher-order-component to add overwritable internal state to a react component. The wrapped
will act like a controlled component (for example, an `<input />`).

## Installation

```
npm install --save @ntgard/react-controllable
```

or, if you are using Yarn

```
yarn add @ntgard/react-controllable
```

## Use

`controllable` accepts three arguments for configuration, and returns a function that accepts a
React component to wrap. That function returns a controllable React component.

### Signature

```
controllable(initialState, mapControllersToState, [options])(Component)
// returns React component that accepts the same props as Component as well as notifier props
```
<b>Arguments</b>
<details>
<summary>initialState</summary>
An object mapping the controllable properties of Component to their initial values
</details>

<br/>
<details>
<summary>mapControllersToState</summary>
An object mapping the controller properties of Component to an object or function to be passed to
<code>setState</code> when the controller is invoked.
</details>

<br/>
<details>
<summary>options</summary>
An optional object with the property <code>isEqual</code> that will override the default triple-equal (<code>===</code>)
check that <code>controllable</code> uses for determining if a controlled prop changed.
</details>

<br/>
<details>
<summary>Component</summary>
A React component.
</details>

<br/>
<b>Return Value</b>
<details>
<summary>Controllable Component</summary>
A new React component that can either be controlled or uncontrolled. This component also accepts
notifier props of the form <code>on*DidChange</code> for each controllable prop. For example, given the following
setup, the returned component, <code>ControllableFoo</code> would accept a prop <code>onBarDidChange</code> that would
fire when <code>bar</code> was changed.
<pre>
const ControllableFoo = controllable({ bar: 'bar' }, { onClick: { bar: 'BAR' }})(Foo);
</pre>
Notifier functions get the new value and the old value for the prop that changed as arguments. This
is useful for when you don't want to control the behavior of the controllable component (that is, 
you leave it uncontrolled) but you want to respond to changes in it.
</details>

### Example

```
import { controllable } from '@ntgard/react-controllable';

// ...

const initialState = { count: 0 };
const mapControllersToState = {
  inc: ({ count }) => ({ count + 1 }),
  dec: ({ count }) => ({ count - 1 }),
}
const ControllableCounter = controllable(initialState, mapControllersToState)(Counter);

// ...

{/* With no overrides, this counter starts at 0 and increments and decrements by 1 */}
<ControllableCounter />

{/* This counter is controlled. It starts at 10 and increments and decrements by 2 */}
let c = 10;
<ControllableCounter count={c} inc={() => { c += 2; }} dec={() => { c -= 2; }} />
```

## License

MIT