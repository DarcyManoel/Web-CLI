let data={}
const INPUT=document.getElementById(`input`)
const INPUT_REFLECTION=document.getElementById(`input-reflection`)
const TERMINAL=document.getElementById(`terminal`)
terminalUpdate(0,`<p class="feedback-landing">Welcome to this interactive web terminal.</p>`)
terminalUpdate(0,`<p class="feedback-landing">For a list of available commands, type <span class="command" onclick="terminalUpdate(1,this.innerHTML);COMMANDS.help.function(this.innerHTML)">'help'</span>.</p>`)
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
	const FEEDBACK_LOST=`<p><span class="feedback-lost">Command not found. For a list of commands, type <span class="command" onclick="terminalUpdate(1,this.innerHTML);COMMANDS.help.function(this.innerHTML)">'help'</span>.</p>`
	let command=COMMANDS
	let keys=key.split(`/`)
	if(key.startsWith(`/`))
		keys[0]=commandsDirectory
	for(let i1=0;i1<keys.length;i1++){
		if(command[keys[i1]]){
			if(i1===keys.length-1)
				if(typeof command[keys[i1]].function===`function`){
					command[keys[i1]].function()
					return
				}
			command=command[keys[i1]].children||{}
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
let commandsDirectory=``
COMMANDS.help={
	description:`Lists all available commands.`,
	function:function(){
		let contentQueue=`<table class="feedback">`
		for(const[key1,value1]of Object.entries(COMMANDS)){
			contentQueue+=`<tr><td ${COMMANDS[key1].children?key1==commandsDirectory?`class="command">&dharl;`:`class="command subtle-element">&rhard;`:``}</td><td class="command" onclick="terminalUpdate(1,this.innerHTML);COMMANDS[this.innerHTML].function()">${key1}</td><td>${value1.description}</td></tr>`
			if(key1==commandsDirectory)
				for(const[key2,value2] of Object.entries(COMMANDS[key1].children))
					contentQueue+=`<tr class="command-nested"><td></td><td class="command" onclick="terminalUpdate(1,this.innerHTML);COMMANDS['${commandsDirectory}'].children[this.innerHTML].function()">${key2}</td><td>${value2.description}</td></tr>`
		}
		contentQueue+=`</table>`
		terminalUpdate(0,contentQueue)
	}
}
COMMANDS.data={
	description:`Enters the data directory. Handles the upload and download of active data.`,
	function:function(){
		commandsDirectory=`data`
		terminalUpdate(0,`<p class="feedback">Entered the data directory.</p>`)
		terminalUpdate(0,`<p class="feedback">Printing updated help table...</p>`)
		COMMANDS.help.function()
	},
	children:{}
}
COMMANDS.data.children.upload={
	description:`Upload a memory file for data use.`,
	function:function(){
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
			oncancel:(e)=>{
				terminalUpdate(0,`<p class="feedback">File upload aborted, user action.</p>`)
				document.body.removeChild(fileInput)}
			}
		)
		document.body.appendChild(fileInput)
		fileInput.click()
	}
}
COMMANDS.data.children.download={
	description:`Download a memory file for data storage.`,
	function:function(){
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