const INPUT=document.getElementById(`input`)
const INPUT_REFLECTION=document.getElementById(`input-reflection`)
const TERMINAL=document.getElementById(`terminal`)
const COMMANDS={}
COMMANDS.help=`Lists all available commands at the active directory.`
function commandHelp(){
	let contentQueue=`<p><table class="feedback">`
	for(const[key,value]of Object.entries(COMMANDS)){
		contentQueue+=`<tr><td class="command">${key}</td><td>${value}</td></tr>`
	}
	contentQueue+=`</table></p>`
	TERMINAL.innerHTML+=contentQueue}
function submitCommand(value){
	INPUT.value=``
	INPUT_REFLECTION.innerHTML=``
	TERMINAL.innerHTML+=`<p>user: ${value}`
	const FEEDBACK_LOST=`<p><span class="feedback-lost">Command not found. For a list of commands, type <span class="command">'help'</span>.</p>`
	COMMANDS[value]
		?window[`command${capitalizeFirstLetter(value)}`]
			?window[`command${capitalizeFirstLetter(value)}`]()
			:TERMINAL.innerHTML+=FEEDBACK_LOST
		:TERMINAL.innerHTML+=FEEDBACK_LOST
	console.log(`command${capitalizeFirstLetter(value)}`)
	document.body.scrollTop=document.body.scrollHeight}
function capitalizeFirstLetter(string){
	return string.charAt(0).toUpperCase()+string.slice(1)}