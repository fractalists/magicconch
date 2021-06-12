var app = new Vue({
  el: '#app',
  data: {
    converted: ''
  },
  methods: {
    logBeautify: function (raw) {
      return logBeautify(raw)
    }
  },
});

function logBeautify(raw) {
  if (isEmpty(raw)) {
    return raw;
  }

  var sb = "";
  var level = 0;

  for (var i = 0; i < raw.length; i++) {

    var ch = raw.charAt(i);

    if (BLANK_SYMBOL.includes(ch)) {
      continue;

    } else if (LEFT_PART.includes(ch)) {
      sb += ' ' + ch + '\n';
      level++;
      sb = addLevel(sb, level);

    } else if (RIGHT_PART.includes(ch)) {
      sb += '\n';
      level--;
      sb = addLevel(sb, level);
      sb += ch;

    } else if (LINE_ENDING.includes(ch)) {
      sb += ch;

      if (i < raw.length - 1 && !RIGHT_PART.includes(raw.charAt(i + 1))) {
        sb += '\n';
        sb = addLevel(sb, level);
      }

    } else {
      sb += ch;
    }

    if (level < 0) {
      level = 0;
    }
  }

  sb = optimizeEqualSign(sb);

  return sb;
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

const LEFT_PART = "([{";
const RIGHT_PART = ")]}";
const LINE_ENDING = ",;";
const BLANK_SYMBOL = " \t";
const INDENT_PLACEHOLDER = "    ";
const NEXT_LINE_DELIMITER = "\n";