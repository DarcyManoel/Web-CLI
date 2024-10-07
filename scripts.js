let data={}
const INPUT=document.getElementById(`input`)
const INPUT_REFLECTION=document.getElementById(`input-reflection`)
const INPUT_SUGGESTION=document.getElementById(`input-suggestion`)
const TERMINAL=document.getElementById(`terminal`)
terminalUpdate(0,`<p class="feedback-landing">Welcome to this interactive web terminal.</p>`)
//	input
function inputCommand(key){
	INPUT_REFLECTION.innerHTML=key
	window.scrollTo(0,document.body.scrollHeight)
	if(key.length){
		for(let i1=0;i1<COMMANDS_SUGGESTIONS.length;i1++){
			if(COMMANDS_SUGGESTIONS[i1].startsWith(key)){
				INPUT_SUGGESTION.innerHTML=COMMANDS_SUGGESTIONS[i1]
				return
			}
		}
		INPUT_SUGGESTION.innerHTML=``
	}else{
		INPUT_SUGGESTION.innerHTML=``
	}
}
function submitCommand(key){
	if(INPUT_SUGGESTION.innerHTML.length){
		key=INPUT_SUGGESTION.innerHTML
	}
	INPUT.value=``
	INPUT_REFLECTION.innerHTML=``
	INPUT_SUGGESTION.innerHTML=``
	const FEEDBACK_LOST=`<p class="feedback-lost">Command not found. For a list of available commands, type <span class="command" onclick="submitCommand(this.innerHTML)">'help'</span>.</p>`
	key=key.replace(/'/g,``)
	terminalUpdate(1,key)
	if(key==`help`){
		let i1=0
		for(const[key1,value1]of Object.entries(HELP)){
			for(const[key2,value2]of Object.entries(value1)){
				setTimeout(terminalUpdate,i1*100,0,`<p class="feedback"><span class="command" onclick="submitCommand(this.innerHTML)">'data ${key2}'</span>${value2}</p>`)
				i1++
			}
		}
		return
	}
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
//		organise dictionary keys by priority for command suggestions
const COMMANDS={}
const HELP={}
COMMANDS.data={
	help:function(){
		let i1=0
		for(const[key,value]of Object.entries(HELP.data)){
			setTimeout(terminalUpdate,i1*100,0,`<p class="feedback"><span class="command" onclick="submitCommand(this.innerHTML)">'data ${key}'</span>${value}</p>`)
			i1++
		}
	},
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
					terminalUpdate(0,`<p class="feedback">File upload successful.</p>`)
				}
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
			return
		}
		const file=new Blob(
			[JSON.stringify(data)],
			{type:`application/json`}
		)
		const link=Object.assign(document.createElement(`a`),{
			href:URL.createObjectURL(file),
			download:`Life CLI.json`
		})
		link.click()
		URL.revokeObjectURL(link.href)
		terminalUpdate(0,`<p class="feedback">File download initialised...</p>`)
	}
}
HELP.data={
	download:`Download the active state of data for storage.`,
	upload:`Upload a data save state file for use.`
}
//	command auto-complete
const COMMANDS_SUGGESTIONS=[]
COMMANDS_SUGGESTIONS.push(`help`)
for(const[key1,value1]of Object.entries(COMMANDS)){
	for(const[key2,value2]of Object.entries(value1)){
		COMMANDS_SUGGESTIONS.push(`${key1} ${key2}`)
	}
}