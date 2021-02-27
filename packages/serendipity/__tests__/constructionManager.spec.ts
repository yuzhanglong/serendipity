/*
 * File: constructionManager.spec.ts
 * Description: ConstructionManager 模块单元测试
 * Created: 2021-2-21 14:00:51
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import * as path from 'path'
import * as fs from 'fs'
import { playgroundTestPath } from '@attachments/serendipity-public/bin/utils/paths'
import { initTestDir } from '@attachments/serendipity-public/bin/utils/testUtils'
import ConstructionManager from '../src/constructionManager'
import PresetManager from '../src/presetManager'

const mockedExeca = require('../../../__mocks__/execa')

jest.mock('execa')


describe('serviceManager 模块', () => {
  beforeEach(() => {
    initTestDir()
  })

  test('installPluginsFromPresets - plugin 信息是否正确写入 package.json', async () => {
    const base = path.resolve(playgroundTestPath)
    const cs = new ConstructionManager(base)
    const pm = new PresetManager(playgroundTestPath)
    pm.initPresetByObject({
      plugins: [
        {
          name: '@attachments/serendipity-plugin-react'
        },
        {
          name: '@attachments/serendipity-plugin-eslint',
          overrideInquiry: {
            foo: 'foo'
          }
        }
      ]
    })
    await cs.installPluginsFromPresets(pm.getPreset())

    const res = fs.readFileSync(path.resolve(playgroundTestPath, 'package.json'))

    expect(JSON.parse(res.toString())).toStrictEqual({
      'name': 'serendipity-project',
      'version': '1.0.0',
      'main': 'index.js',
      'license': 'MIT',
      'dependencies': {
        '@attachments/serendipity-plugin-react': 'latest',
        '@attachments/serendipity-plugin-eslint': 'latest'
      }
    })

    // 一次 yarn install 被执行
    expect(mockedExeca.getCommands())
      .toStrictEqual([
        'yarn install'
      ])
  })
})
