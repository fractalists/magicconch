const LEFT_PART = "[{";
const RIGHT_PART = "]}";
const LINE_ENDING = ",;";
const BLANK_SYMBOL = " \t";
const INDENT_PLACEHOLDER = "    ";
const NEXT_LINE_DELIMITER = "\n";

function logBeautify(input) {
  if (isEmpty(input)) {
    return input;
  }

  // update url in browser
  var newUrl = genNewUrl(input);
  window.history.pushState({}, "", newUrl);

  var raws = input.split(NEXT_LINE_DELIMITER);
  var raw = '';
  var result = '';

  for (lineIndex = 0; lineIndex < raws.length; lineIndex++) {
    raw = raws[lineIndex];

    if (isEmpty(raw)) {
      continue;
    }

    var sb = "";
    var level = 0;
    var matched = '';
    var regex = '';

    // dealing with common golang logger output
    regex = /^\s*[a-zA-Z]{3,5} \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[\.,]\d{3} [^.]+\.go:\d+\s*/g;
    matched = raw.match(regex);
    if (matched != null && !isEmpty(matched[0])) {
      sb = sb + matched[0].trim() + '\n';
      raw = raw.substr(matched[0].length);
    }

    regex = /^\s*[a-z]+\.[a-z]+\.[a-z]+ \d+\.\d+\.\d+\.\d+\s*/g;
    matched = raw.match(regex);
    if (matched != null && !isEmpty(matched[0])) {
      sb = sb + matched[0].trim() + '\n';
      raw = raw.substr(matched[0].length);
    }

    regex = /^\s*\d+\.\d+\.\d+\.\d+ [a-z]+\.[a-z]+\.[a-z]+\s*/g;
    matched = raw.match(regex);
    if (matched != null && !isEmpty(matched[0])) {
      sb = sb + matched[0].trim() + '\n';
      raw = raw.substr(matched[0].length);
    }

    regex = /^\s*[0-9A-Z]{34}\s*/g;
    matched = raw.match(regex);
    if (matched != null && !isEmpty(matched[0])) {
      sb = sb + matched[0].trim() + '\n';
      raw = raw.substr(matched[0].length);
    }

    regex = /^\s*[-]?\s*default (single_dc|canary)\s*/g;
    matched = raw.match(regex);
    if (matched != null && !isEmpty(matched[0])) {
      sb = sb + matched[0].trim() + '\n';
      raw = raw.substr(matched[0].length);
    }

    var isNewLine = true;
    for (var i = 0; i < raw.length; i++) {

      var ch = raw.charAt(i);

      if (BLANK_SYMBOL.includes(ch)) {
        if (isNewLine == false) {
          sb += ' ';
        }
        continue;

      } else if (LEFT_PART.includes(ch)) {
        sb += ' ' + ch + '\n';
        isNewLine = true;
        level++;
        sb = addLevel(sb, level);

      } else if (RIGHT_PART.includes(ch)) {
        sb += '\n';
        isNewLine = true;
        level--;
        sb = addLevel(sb, level);
        sb += ch;
        isNewLine = false;

      } else if (LINE_ENDING.includes(ch)) {
        sb += ch;
        isNewLine = false;

        if (i < raw.length - 1 && !RIGHT_PART.includes(raw.charAt(i + 1))) {
          sb += '\n';
          isNewLine = true;
          sb = addLevel(sb, level);
        }

      } else {
        sb += ch;
        isNewLine = false;
      }

      if (level < 0) {
        level = 0;
      }
    }

    sb = optimizeEqualSign(sb);
    result = result + sb + "\n\n\n";
  }

  return result;
}

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function addLevel(raw, level) {
  for (i = 0; i < level; i++) {
    raw = raw + INDENT_PLACEHOLDER;
  }
  return raw;
}

function optimizeEqualSign(raw) {
  var resultList = [];
  var lines = raw.split(NEXT_LINE_DELIMITER);

  for (j = 0; j < lines.length; j++) {
    var line = lines[j];
    var equalSignPos = -1;

    for (var i = 0; i < line.length; i++) {
      if (line.charAt(i) == '\"') {
        break;

      } else if (line.charAt(i) == '=') {
        equalSignPos = i;
        break;
      }
    }

    if (equalSignPos == -1) {
      resultList.push(line);

    } else {
      var tmp = line.substring(0, equalSignPos) + " = " +
        line.substring(equalSignPos + 1);
      resultList.push(tmp);
    }

  }

  return resultList.join(NEXT_LINE_DELIMITER);
}

function genNewUrl(raw) {
  var prefix = location.origin + location.pathname;

  if (!raw || isEmpty(raw)) {
    return prefix;
  }


  return prefix + "?query=" + encodeURIComponent(raw);
}

function getRequestParams() {
  var url = location.search;

  if (url.indexOf("?") == -1) {
    return null;
  }

  var params = new Object();

  var str = url.substr(1);
  strs = str.split("&");
  for (var i = 0; i < strs.length; i++) {
    params[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
  }

  return params;
}

function windowOnLoad() {
  var params = getRequestParams();
  if (params == null || isEmpty(params['query'])) {
    return;
  }

  let el = document.getElementById("left");
  el.value = params['query'];
  el.dispatchEvent(new Event('input'));
}