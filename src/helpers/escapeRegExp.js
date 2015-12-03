/**
 * @author rik
 */
function escapeRegExp(str = "") {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export default escapeRegExp;