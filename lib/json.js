/**
 * @module lib/json
 */

import { fsmToTree } from "./tree";
import sketchFsm from "./sketchFsm";

/**
 * Description
 * @param json
 */
export function deserialize(json) {
  log.info("Deserialize");
  const descriptor = JSON.parse(json);
  return sketchFsm({ descriptor });
};

/**
 * Description
 * @param fsm
 */
export function serialize(fsm) {
  log.info("Serialize");
  const tree = fsmToTree(fsm);
  return JSON.stringify(tree, null, 2);
};
