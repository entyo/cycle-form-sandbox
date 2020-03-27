import * as Snabbdom from "snabbdom-pragma";

import { makeDOMDriver, MainDOMSource, button, VNode } from "@cycle/dom";
import { run, Sources } from "@cycle/run";
import { Field, Intent, View, ViewInput, MetaData, form } from "cyclic-form";
import { Endo } from "jazz-func/endo";
import { Stream } from "xstream";
import { withState } from "@cycle/state";

function makeTextField({
  autofocus = false,
  large = false,
  name,
  placeholder = ""
}): Field<string> {
  const intent: Intent<string> = (DOM: MainDOMSource) =>
    DOM.events("input").map<Endo<string>>((e: any) => _ => e.target.value);

  const view: View<string> = (input: ViewInput<string>) => {
    const { value } = input;

    const textFieldVNode = (
      <input
        {...{ autofocus, large, value }}
        name={name}
        placeholder={placeholder}
      />
    );

    return <div>{textFieldVNode}</div>;
  };

  return {
    intent,
    view
  };
}

export function submitButton({
  label,
  large = false,
  preventDefault = true,
  type = "primary",
  tooltip = "",
  className
}): Field<boolean> {
  const intent: Intent<boolean> = (DOM: MainDOMSource) =>
    DOM.select("form")
      .events("submit", { preventDefault })
      .mapTo<Endo<boolean>>(_ => true);

  const view: View<boolean> = (
    { value: submitting }: ViewInput<boolean>,
    { valid }: MetaData
  ) => (
    <button
      className={className}
      disabled={!valid || submitting}
      kind={type}
      large={large}
      processing={submitting}
      tooltip={tooltip}
      type="submit"
    >
      {label}
    </button>
  );
  const field = { intent, view };

  (field as any).shouldNotIsolate = true;

  return field;
}

const formFields = {
  input: makeTextField({ name: "name" }),
  submit: submitButton({ label: "送信", className: "submit" })
};

type FormFields = typeof formFields;

const myForm = form(formFields);

function renderForm(fields: FormFields): VNode {
  return (
    <form>
      {fields.input}
      {fields.submit}
    </form>
  );
}

function main(sources) {
  const sourceState$ = sources.state.stream;

  const { DOM: DOM$, submission$, state: state$ } = myForm({
    DOM: sources.DOM,
    state: sources.state,
    renderer$: Stream.of(renderForm).remember() as any
  });

  submission$.addListener({ next: e => console.log({ e }) });

  const vdom$ = DOM$.map(formNode => (
    <div>
      <h1>これはページタイトル</h1>
      {formNode}
    </div>
  ));

  const initialReducer$ = Stream.of(() => 0);
  const addOneReducer$ = Stream.periodic(1000).mapTo(prev => prev + 1);
  const reducer$ = Stream.merge(initialReducer$, addOneReducer$);

  return {
    DOM: vdom$,
    state: reducer$
  };
}

run(withState(main as any), { DOM: makeDOMDriver("#app") });
