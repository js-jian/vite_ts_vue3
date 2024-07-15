export default {
  printWidth: 120, // 一行最多多少个字符
  tabWidth: 2, // 指定每个缩进级别的空格数
  useTabs: false, // 是否使用制表符而不是空格缩进行
  semi: true, // 在语句末尾打印分号
  singleQuote: false, // 是否使用单引号而不是双引号
  trailingComma: "es5", // 在 ES5 中有效的尾随逗号（对象、数组等）。TypeScript 和 Flow 中类型参数中的尾随逗号
  arrowParens: "avoid", // 在唯一的箭头函数参数周围【省略】括号 示例：x => x
  endOfLine: "lf", // 仅换行 (\n)，在 Linux 和 macOS 以及 git repos 中很常见
};
