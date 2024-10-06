let data={}
const INPUT=document.getElementById(`input`)
const INPUT_REFLECTION=document.getElementById(`input-reflection`)
const TERMINAL=document.getElementById(`terminal`)
terminalUpdate(0,`<p class="feedback-landing">Welcome to this interactive web terminal.</p>`)
//	input
function inputCommand(key){
	INPUT_REFLECTION.innerHTML=key
	window.scrollTo(0,document.body.scrollHeight)
}
function submitCommand(key){
	INPUT.value=``
	INPUT_REFLECTION.innerHTML=``
	document.getElementById(`command-prefix`).innerHTML=`user:`
	terminalUpdate(1,key)
	const FEEDBACK_LOST=`<p><span class="feedback-lost">Command not found.</p>`
	let command=COMMANDS
	let keys=key.split(` `)
	for(let i1=0;i1<keys.length;i1++){
		if(command[keys[i1]]){
			if(i1===keys.length-1){
				if(typeof command[keys[i1]]===`function`){
					command[keys[i1]]()
					return
				}else{
					terminalUpdate(0,FEEDBACK_LOST)
					return
				}
			}
			command=command[keys[i1]]
		}else{
			terminalUpdate(0,FEEDBACK_LOST)
			return
		}
	}
}
//	output
function terminalUpdate(isCommand,content){
	isCommand
		?TERMINAL.insertAdjacentHTML(`beforeend`,`<p><span class='subtle-element'>user:</span> ${content}`)
		:TERMINAL.insertAdjacentHTML(`beforeend`,content)
	window.scrollTo(0,document.body.scrollHeight)
}
//	commands
const COMMANDS={}
COMMANDS.data={
	upload:function(){
		terminalUpdate(0,`<p class="feedback">File upload initiated...</p>`)
		const fileInput=Object.assign(document.createElement(`input`),{
			type:`file`,
			accept:`.json`,
			style:`display:none`,
			onchange:(e)=>{
				const reader=new FileReader()
				reader.onload=(e)=>{
					data=JSON.parse(e.target.result)
					console.log(data)
					terminalUpdate(0,`<p class="feedback">File upload successful.</p>`)}
				reader.readAsText(e.target.files[0])
				document.body.removeChild(fileInput)
			},
			oncancel:()=>{
				terminalUpdate(0,`<p class="feedback">File upload aborted, user action.</p>`)
				document.body.removeChild(fileInput)}
			}
		)
		document.body.appendChild(fileInput)
		fileInput.click()
	},
	download:function(){
		if(!Object.keys(data).length){
			terminalUpdate(0,`<p class="feedback">File download aborted, no data.</p>`)
			return}
		const file=new Blob(
			[JSON.stringify(data)],
			{type:`application/json`})
		const link=Object.assign(document.createElement(`a`),{
			href:URL.createObjectURL(file),
			download:`Life CLI.json`})
		link.click()
		URL.revokeObjectURL(link.href)
		terminalUpdate(0,`<p class="feedback">File download initialised...</p>`)
	}
}