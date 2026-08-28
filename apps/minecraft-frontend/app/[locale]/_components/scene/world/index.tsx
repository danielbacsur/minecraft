"use client";

import { Field } from "./field";
import { scatter } from "./scatter";

export function World() {
  return <Field block="short_grass" at={scatter()} />;
}
