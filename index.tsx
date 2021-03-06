import * as Snabbdom from "snabbdom-pragma";
import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";

function main(sources) {
  const input$ = sources.DOM.select(".field").events("input");
  const submission$ = sources.DOM.select(".form")
    .events("submit", {
      preventDefault: true
    })
    .mapTo(true);
  submission$.addListener({ next: e => console.log({ e }) });

  const name$ = input$.map(ev => ev.target.value).startWith("");

  const vdom$ = name$.map(name => (
    <form className="form">
      <label>Name:</label>
      <input className="field" type="text" />
      <button className="button" type="submit">
        Submit!
      </button>
    </form>
  ));

  return { DOM: vdom$ };
}

run(main, { DOM: makeDOMDriver("#app") });
