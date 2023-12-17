import * as fs from 'fs/promises'
import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import virtual from '@rollup/plugin-virtual'

await build('src','dist')

async function build(srcDir,dstDir) {
	await cleanupDirectory(dstDir)
	await buildJs(srcDir,dstDir)
	await fs.copyFile(`${srcDir}/manifest.json`,`${dstDir}/manifest.json`)
}

async function cleanupDirectory(dir) {
	await fs.mkdir(dir,{recursive:true})
	for (const filename of await fs.readdir(dir)) { // delete contents instead of the whole dir because live server doesn't like the dir disappearing
			await fs.rm(`${dir}/${filename}`,{recursive:true,force:true})
	}
}

async function buildJs(srcDir,dstDir) {
	const svgData=await readSvgData(srcDir)
	const plugins=[
		virtual({
			[`${srcDir}/svg-data`]: `export default `+JSON.stringify(svgData,undefined,4)
		}),
		typescript()
	]
	const bundleRootModules=['background','init','changeset']
	for (const module of bundleRootModules) {
		const bundle=await rollup({
				input: `${srcDir}/${module}.ts`,
				plugins
		})
		bundle.write({
				file: `${dstDir}/${module}.js`,
		})
		bundle.close()
	}
}

async function readSvgData(srcDir) {
	const svgData={}
	for (const filename of await fs.readdir(`${srcDir}/svg`)) {
		const match=filename.match(/^(.*)\.svg$/)
		if (!match) continue
		const [,name]=match
		const svg=await fs.readFile(`${srcDir}/svg/${filename}`,'utf-8')
		svgData[name]=svg
	}
	return svgData
}
