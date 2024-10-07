let data={}
const INPUT=document.getElementById(`input`)
const INPUT_REFLECTION=document.getElementById(`input-reflection`)
const INPUT_SUGGESTION=document.getElementById(`input-suggestion`)
//	input
function inputKeyDown(key,event){
	INPUT.setSelectionRange(input.value.length,input.value.length)
	event=event||window.event
	switch(event.keyCode){
		//	enter/return
		case 13:
			if(INPUT.value.length){
				submitCommand(key)
			}
			break
	}
}
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
const FEEDBACK_LOST=`<span class="feedback-lost">Command not found. For a list of available commands, type <span class="feedback-command" onclick="submitCommand(this.innerHTML.replace(/'/g,''))">'help'</span>.`
function submitCommand(key){
	if(INPUT_SUGGESTION.innerHTML.length){
		key=INPUT_SUGGESTION.innerHTML
	}
	INPUT.value=``
	INPUT_REFLECTION.innerHTML=``
	INPUT_SUGGESTION.innerHTML=``
	TERMINAL_BACKLOG_COMMAND.push(`<span class="subtle-element">user:</span> ${key}`)
	let command=COMMANDS
	let keys=key.split(`.`)
	for(let i1=0;i1<keys.length;i1++){
		if(command[keys[i1]]){
			if(i1===keys.length-1){
				if(typeof command[keys[i1]]===`function`){
					command[keys[i1]]()
					return
				}else{
					TERMINAL_BACKLOG_FEEDBACK.push(FEEDBACK_LOST)
					return
				}
			}
			command=command[keys[i1]]
		}else{
			TERMINAL_BACKLOG_FEEDBACK.push(FEEDBACK_LOST)
			return
		}
	}
}
//	output
const TERMINAL=document.getElementById(`terminal`)
const TERMINAL_BACKLOG_COMMAND=[]
const TERMINAL_BACKLOG_FEEDBACK=[]
TERMINAL_BACKLOG_FEEDBACK.push(`<span class="feedback-landing">Welcome to this interactive web terminal.`)
setInterval(terminalUpdate,100)
function terminalUpdate(){
	if(TERMINAL_BACKLOG_COMMAND.length){
		TERMINAL.insertAdjacentHTML(`beforeend`,`<p class="command">${TERMINAL_BACKLOG_COMMAND[0]}`)
		TERMINAL_BACKLOG_COMMAND.shift()
	}
	if(TERMINAL_BACKLOG_FEEDBACK.length){
		TERMINAL.insertAdjacentHTML(`beforeend`,`<p>${TERMINAL_BACKLOG_FEEDBACK[0]}`)
		TERMINAL_BACKLOG_FEEDBACK.shift()
	}
	window.scrollTo(0,document.body.scrollHeight)
}
//	commands
const COMMANDS={}
COMMANDS.help=function(){
	for(const[key1,value1]of Object.entries(COMMANDS)){
		if(typeof value1===`function`){
			TERMINAL_BACKLOG_FEEDBACK.push(`<span class="feedback-command" onclick="submitCommand(this.innerHTML.replace(/'/g,''))">'${key1}'`)
			continue
		}
		for(const[key2,value2]of Object.entries(value1)){
			TERMINAL_BACKLOG_FEEDBACK.push(`<span class="feedback-command" onclick="submitCommand(this.innerHTML.replace(/'/g,''))">'${key1}.${key2}'`)
		}
	}
}
COMMANDS.data={
	upload:function(){
		TERMINAL_BACKLOG_FEEDBACK.push(`File upload initiated...`)
		const fileInput=Object.assign(document.createElement(`input`),{
			type:`file`,
			accept:`.json`,
			style:`display:none`,
			onchange:(e)=>{
				const reader=new FileReader()
				reader.onload=(e)=>{
					data=JSON.parse(e.target.result)
					console.log(data)
					TERMINAL_BACKLOG_FEEDBACK.push(`File upload successful.`)
				}
				reader.readAsText(e.target.files[0])
				document.body.removeChild(fileInput)
			},
			oncancel:()=>{
				TERMINAL_BACKLOG_FEEDBACK.push(`File upload aborted, user action.`)
				document.body.removeChild(fileInput)}
			}
		)
		document.body.appendChild(fileInput)
		fileInput.click()
	},
	download:function(){
		if(!Object.keys(data).length){
			TERMINAL_BACKLOG_FEEDBACK.push(`File download aborted, no data.`)
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
		TERMINAL_BACKLOG_FEEDBACK.push(`File download initialised...`)
	}
}
//	command auto-complete
const COMMANDS_SUGGESTIONS=[]
COMMANDS_SUGGESTIONS.push(`help`)
for(const[key1,value1]of Object.entries(COMMANDS)){
	for(const[key2,value2]of Object.entries(value1)){
		COMMANDS_SUGGESTIONS.push(`${key1}.${key2}`)
	}
}