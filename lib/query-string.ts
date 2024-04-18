import queryString from "qs";
import * as queryTypes from "query-types";

export function parse(value: string) {
  return queryTypes.parseObject(queryString.parse(value));
}

export function stringify(value: unknown) {
  return queryString.stringify(value);
}
