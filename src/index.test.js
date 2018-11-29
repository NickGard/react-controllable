import React from 'react';
import { controllable } from './index';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const Component = ({ count, inc, dec }) => (
  <div>
    <button id="dec" type="button" onClick={dec}>
      ⬇️
    </button>
    <span>{count}</span>
    <button id="inc" type="button" onClick={inc}>
      ⬆️
    </button>
  </div>
);

describe('controllable', () => {
  it('should allow controllable component to be entirely uncontrolled', () => {
    const incSpy = jest.fn(({ count }) => ({ count: count + 1 }));
    const decSpy = jest.fn(({ count }) => ({ count: count - 1 }));
    const initialState = { count: 0 };
    const mapControllersToState = {
      inc: incSpy,
      dec: decSpy,
    };
    const ControllableComponent = controllable(
      initialState,
      mapControllersToState
    )(Component);
    const wrapper = mount(<ControllableComponent />);

    expect(wrapper.find(Component).props().count).toBe(0);
    wrapper.find('button#inc').simulate('click');
    expect(incSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.find(Component).props().count).toBe(1);
    wrapper.find('button#dec').simulate('click');
    wrapper.find('button#dec').simulate('click');
    expect(decSpy).toHaveBeenCalledTimes(2);
    expect(wrapper.find(Component).props().count).toBe(-1);
  });

  it('should allow controllable component to be entirely controlled', () => {
    const incSpy = jest.fn(({ count }) => ({ count: count + 1 }));
    const decSpy = jest.fn(({ count }) => ({ count: count - 1 }));
    const initialState = { count: 0 };
    const mapControllersToState = { inc: incSpy, dec: decSpy };
    const ControllableComponent = controllable(
      initialState,
      mapControllersToState
    )(Component);
    let controlledDecSpy = jest.fn();
    let controlledIncSpy = jest.fn();
    class Parent extends React.Component {
      constructor() {
        super();
        this.state = { count: 5 };
        this.inc = this.inc.bind(this);
        this.dec = this.dec.bind(this);
      }
      inc() {
        controlledIncSpy();
        this.setState(({ count }) => ({ count: count + 2 }));
      }
      dec() {
        controlledDecSpy();
        this.setState(({ count }) => ({ count: count - 2 }));
      }
      render() {
        return (
          <ControllableComponent
            count={this.state.count}
            inc={this.inc}
            dec={this.dec}
          />
        );
      }
    }
    const wrapper = mount(<Parent />);

    expect(wrapper.find(Component).props().count).toBe(5);
    wrapper.find('button#inc').simulate('click');
    expect(incSpy).not.toHaveBeenCalled();
    expect(controlledIncSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.find(Component).props().count).toBe(7);
    wrapper.find('button#dec').simulate('click');
    expect(decSpy).not.toHaveBeenCalled();
    expect(controlledDecSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.find(Component).props().count).toBe(5);
  });

  it('should fire on*DidChange handlers when controlled props change', () => {
    const initialState = { count: 0 };
    const mapControllersToState = {
      inc: ({ count }) => ({ count: count + 1 }),
      dec: ({ count }) => ({ count: count - 1 }),
    };
    const ControllableComponent = controllable(
      initialState,
      mapControllersToState
    )(Component);
    const onCountDidChangeSpy = jest.fn();
    const wrapper = mount(
      <ControllableComponent onCountDidChange={onCountDidChangeSpy} />
    );

    wrapper.find('button#inc').simulate('click');
    expect(onCountDidChangeSpy).toHaveBeenCalledTimes(1);
    expect(onCountDidChangeSpy).toHaveBeenCalledWith(1, 0);
    wrapper.find('button#dec').simulate('click');
    expect(onCountDidChangeSpy).toHaveBeenCalledTimes(2);
    expect(onCountDidChangeSpy).toHaveBeenCalledWith(0, 1);
  });

  it('should allow isEqual option to be used instead of the default', () => {
    const initialState = { count: 0 };
    const mapControllersToState = {
      inc: ({ count }) => ({ count: count + 1 }),
      dec: ({ count }) => ({ count: count - 1 }),
    };
    const isEqualSpy = jest.fn();
    const ControllableComponent = controllable(
      initialState,
      mapControllersToState,
      { isEqual: isEqualSpy }
    )(Component);
    const wrapper = mount(<ControllableComponent />);

    wrapper.find('button#inc').simulate('click');
    expect(isEqualSpy).toHaveBeenCalled();
  });
});
