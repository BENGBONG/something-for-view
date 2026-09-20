const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const context = {window:{},TextEncoder};
vm.runInNewContext(fs.readFileSync('prototypes/baizhi-pc-home-v13/assets/apps-table-export.js','utf8'),context);
const build=context.window.AppsTableExport.build;
const bytes=build("表/[名称]?",['文本','数值','布尔','JSON','空值'],[['=SUM(1,2)',0,false,{渠道:'电话 & <客户>'},null],['中文',350000,true,'01234567890123456789','']]);
const check=spawnSync('python3',['-c',`
import io, sys, zipfile, xml.etree.ElementTree as E
z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read()))
assert z.testzip() is None
for name in z.namelist(): E.fromstring(z.read(name))
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
sheet=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
rows=sheet.findall('s:sheetData/s:row',ns)
assert len(rows)==3
assert sheet.find('.//s:f',ns) is None
assert rows[1][0].attrib['t']=='inlineStr'
assert rows[1][0].find('s:is/s:t',ns).text=='=SUM(1,2)'
assert rows[1][1].find('s:v',ns).text=='0'
assert rows[1][2].attrib['t']=='b' and rows[1][2].find('s:v',ns).text=='0'
assert '电话 & <客户>' in rows[1][3].find('s:is/s:t',ns).text
assert rows[2][3].find('s:is/s:t',ns).text=='01234567890123456789'
assert sheet.find('s:autoFilter',ns).attrib['ref']=='A1:E3'
print('XLSX: ZIP integrity, XML, Unicode, formula safety, zero/false, JSON and identifiers passed')
`],{input:bytes});
assert.equal(check.status,0,check.stderr.toString());
assert.ok(build('空表',['字段'],[]).length>0);
console.log(check.stdout.toString().trim());
