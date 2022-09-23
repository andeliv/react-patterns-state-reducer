import { useState, useReducer, useRef } from "react";
import "./styles.css";
import { Switch } from "./Switch";

const ACTION_TYPE = {
  toggle: "TOGGLE",
  reset: "RESET"
};

function toggleReducer(state, { actionType, initialState }) {
  switch (actionType) {
    case ACTION_TYPE.toggle:
      return {
        ...state,
        on: !state.on
      };
    case ACTION_TYPE.reset:
      return initialState;
    default:
      throw new Error(`Unknown action type ${actionType}`);
  }
}

const callAll = (...fns) => (...args) => fns.forEach((fn) => fn?.(...args));

// Here we can't control toggle with our custom limit of 4 max clicks
/*const useToggle = () => {
  const [{ on }, dispatch] = useReducer(toggleReducer, initialState);
  const toggle = () => dispatch({ actionType: ACTION_TYPE.toggle });
  const reset = () => dispatch({ actionType: ACTION_TYPE.reset, initialState });

  function getTogglerProps({ onClick, ...props } = {}) {
    return {
      "aria-pressed": on,
      onClick: callAll(toggle, onClick),
      ...props
    };
  }

  function getResetterProps({ onClick, ...props }) {
    return {
      onClick: callAll(reset, onClick),
      ...props
    };
  }

  return {
    on,
    getTogglerProps,
    getResetterProps
  };
};*/

const useToggle = ({ initialOn = false, reducer = toggleReducer } = {}) => {
  const [initialState] = useState({ on: initialOn, internalField: false });
  const [{ on }, dispatch] = useReducer(reducer, initialState);
  const toggle = () => dispatch({ actionType: ACTION_TYPE.toggle });
  const reset = () => dispatch({ actionType: ACTION_TYPE.reset, initialState });

  function getTogglerProps({ onClick, ...props } = {}) {
    return {
      "aria-pressed": on,
      onClick: callAll(toggle, onClick),
      ...props
    };
  }

  function getResetterProps({ onClick, ...props }) {
    return {
      onClick: callAll(reset, onClick),
      ...props
    };
  }

  return {
    on,
    getTogglerProps,
    getResetterProps
  };
};

function App() {
  const [timesClicked, setTimesClicked] = useState(0);
  const clickedTooMuch = timesClicked >= 4;
  const onClick = () => setTimesClicked((timesClicked) => timesClicked + 1);

  function customReducer(state, action) {
    if (action.actionType === ACTION_TYPE.toggle && clickedTooMuch) {
      return state;
    }

    return toggleReducer(state, action);
  }

  const { on, getTogglerProps, getResetterProps } = useToggle({
    reducer: customReducer,
    initialOn: true
  });

  return (
    <div>
      <Switch {...getTogglerProps({ onClick, on })} />
      <hr />
      {clickedTooMuch ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : timesClicked > 0 ? (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      ) : null}
      <button {...getResetterProps({ onClick: () => setTimesClicked(0) })}>
        Reset
      </button>
    </div>
  );
}

export default App;
