let data={}
const INPUT=document.getElementById(`input`)
const INPUT_REFLECTION=document.getElementById(`input-reflection`)
const INPUT_SUGGESTION=document.getElementById(`input-suggestion`)
//	input
function inputKeyDown(key,event){
	INPUT.setSelectionRange(input.value.length,input.value.length)
	event=event||window.event
	if(!INPUT.value.length){
		return
	}
	switch(event.keyCode){
		//	tab
		case 9:
			if(INPUT_SUGGESTION.innerHTML.length){
				INPUT.value=INPUT_SUGGESTION.innerHTML
				INPUT_REFLECTION.innerHTML=INPUT_SUGGESTION.innerHTML
				INPUT_SUGGESTION.innerHTML=``
			}
			break
		//	enter/return
		case 13:
			submitCommand(key)
			break
	}
}
function inputCommand(key){
	INPUT_REFLECTION.innerHTML=key
	window.scrollTo(0,document.body.scrollHeight)
	if(key==INPUT_SUGGESTION.innerHTML){
		INPUT_SUGGESTION.innerHTML=``
		return
	}
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
	INPUT.value=``
	INPUT_REFLECTION.innerHTML=``
	INPUT_SUGGESTION.innerHTML=``
	TERMINAL_BACKLOG_COMMAND.push(`<span class="subtle-element">root:</span> ${key}`)
	try{COMMANDS[key]()}
	catch{TERMINAL_BACKLOG_FEEDBACK.push(FEEDBACK_LOST)}
}
//	output
const TERMINAL=document.getElementById(`terminal`)
const TERMINAL_BACKLOG_COMMAND=[]
const TERMINAL_BACKLOG_FEEDBACK=[]
TERMINAL_BACKLOG_FEEDBACK.push(`<span class="feedback-landing">Welcome to this interactive web terminal.`)
setInterval(terminalUpdate,100,TERMINAL_BACKLOG_COMMAND,TERMINAL_BACKLOG_FEEDBACK)
function terminalUpdate(command,feedback){
	if(command.length){
		TERMINAL.insertAdjacentHTML(`beforeend`,`<p class="command">${command[0]}`)
		command.shift()
		window.scrollTo(0,document.body.scrollHeight)
	}
	if(feedback.length){
		TERMINAL.insertAdjacentHTML(`beforeend`,`<p>${feedback[0]}`)
		feedback.shift()
		window.scrollTo(0,document.body.scrollHeight)
	}
}
//	commands
const COMMANDS={}
COMMANDS.upload=function(){
	TERMINAL_BACKLOG_FEEDBACK.push(`File upload initiated.`)
	const fileInput=document.createElement(`input`)
	fileInput.type=`file`
	fileInput.accept=`.json`
	fileInput.style.display=`none`
	fileInput.onchange=(e)=>{
		const reader=new FileReader()
		reader.onload=()=>{
			data=JSON.parse(reader.result)
			console.log(data)
		}
		reader.readAsText(e.target.files[0])
		document.body.removeChild(fileInput)
	}
	fileInput.oncancel=()=>{
		document.body.removeChild(fileInput)
	}
	document.body.appendChild(fileInput)
	fileInput.click()
}
COMMANDS.download=function(){
	const hasData=Object.keys(data).length
	if(!hasData){
		TERMINAL_BACKLOG_FEEDBACK.push(`File download blocked, no data to download.`)
		return
	}
	const file=new Blob([JSON.stringify(data)],{type:`application/json`})
	const link=document.createElement(`a`)
	link.href=URL.createObjectURL(file)
	link.download=`Life CLI.json`
	link.click()
	URL.revokeObjectURL(link.href)
	TERMINAL_BACKLOG_FEEDBACK.push(`File download initialised.`)
}
//	command auto-complete
const COMMANDS_SUGGESTIONS=[]
for(const[key1,value1]of Object.entries(COMMANDS)){
	COMMANDS_SUGGESTIONS.push(`${key1}`)
}