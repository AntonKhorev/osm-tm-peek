console.log(`injected into changeset page`)

const $test = document.createElement('div')
$test.textContent = `Testing html injection`
document.body.append($test)
