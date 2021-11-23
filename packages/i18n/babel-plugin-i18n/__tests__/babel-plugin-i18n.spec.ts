/// <reference types="@types/jest" />

import { PluginOptions, transformSync } from '@babel/core';
import I18nBabelPlugin from '../src';
import { removeWhiteSpace } from '@attachments/utils/lib/public';

/**
 * 调用插件逻辑转换代码
 *
 * @author yuzhanglong
 * @date 2021-11-23 23:59:20
 * @param rawCode 源代码
 * @return 转换后的代码，注意，该结果会去除所有非空格字符
 */
const getParsedCode = (rawCode: string) => {
  const { code } = transformSync(rawCode, {
    filename: 'index.js',
    plugins: [
      ['@babel/plugin-transform-typescript'],
      [
        I18nBabelPlugin,
        {
          intlKeyPrefix: 'Yzl_Test',
        } as PluginOptions,
      ],
    ],
  });

  return removeWhiteSpace(code);
};

describe('test babel-plugin-i18n', () => {
  test('intl 方法 + 字符串直接调用，在其中没有字符串拼接和模板字符串', () => {
    const example = `intl('Yzl_Test_Name', {})`;
    expect(getParsedCode(example)).toStrictEqual(
      removeWhiteSpace(`intl(/*i18n-key-to-compress:"Yzl_Test_Name"*/ 'Yzl_Test_Name',{});`)
    );
  });

  test('顺着作用域链查找到的不是 window 上的 intl 方法, 不应该进行处理', () => {
    const example1 = `
    const intl = () => {};
    intl('Yzl_Test_Ok', {});
    `;

    expect(getParsedCode(example1)).toStrictEqual(removeWhiteSpace(example1));
  });

  test('兼容输出的 var 声明提升, 不应该进行处理', () => {
    const example = `
    intl('Yzl_Test_Ok', {});
    var intl = () => {};
    `;

    expect(getParsedCode(example)).toStrictEqual(removeWhiteSpace(example));
  });

  test('处理三元表达式', () => {
    const example = `
    intl(isOk ? 'Yzl_Test_Ok' : 'Yzl_Test_No', {});
    `;

    expect(getParsedCode(example)).toStrictEqual(
      removeWhiteSpace(
        `intl(isOk ? /*i18n-key-to-compress: "Yzl_Test_Ok"*/ 'Yzl_Test_Ok': /*i18n-key-to-compress: "Yzl_Test_No"*/ 'Yzl_Test_No', {});`
      )
    );

    const example2 = `
    const result = isOk ? intl('Yzl_Test_Ok') : intl('Yzl_Test_No');
    `;
    expect(getParsedCode(example2)).toStrictEqual(
      removeWhiteSpace(
        `const result = isOk ? intl(/*i18n-key-to-compress: "Yzl_Test_Ok"*/ 'Yzl_Test_Ok') : intl(/*i18n-key-to-compress: "Yzl_Test_No"*/ 'Yzl_Test_No');`
      )
    );
  });

  test('测试 intl 中的常量应用', () => {
    const code = `
    const OK = 'Yzl_Test_Ok'
    intl(OK, {})
    `;

    expect(getParsedCode(code)).toStrictEqual(
      removeWhiteSpace(`constOK = /*i18n-key-compress-ignore:"Yzl_Test_Ok"*/ 'Yzl_Test_Ok'; intl(OK, {});`)
    );
  });
});
