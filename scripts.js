const INPUT=document.getElementById(`input`)
const INPUT_REFLECTION=document.getElementById(`input-reflection`)
const TERMINAL=document.getElementById(`terminal`)
function submitCommand(value){
	INPUT.value=``
	INPUT_REFLECTION.innerHTML=``
	terminalUpdate(`<p>user: ${value}`)
	const FEEDBACK_LOST=`<p><span class="feedback-lost">Command not found. For a list of commands, type <span class="command" onclick="runCommandFromKey(1,this.innerHTML)">'help'</span>.</p>`
	COMMANDS[commandsDirectory][value]
		?runCommandFromKey(0,value)
			?runCommandFromKey(1,value)
			:terminalUpdate(FEEDBACK_LOST)
		:terminalUpdate(FEEDBACK_LOST)}
function runCommandFromKey(doRun,key){
	let doesFunctionExist=0
	const COMMAND=window[`command${capitalizeFirstLetter(key.replace(/'/g,``))}`]
	doRun
		?COMMAND()
		:doesFunctionExist=COMMAND
	return doesFunctionExist}
function capitalizeFirstLetter(string){
	return string.charAt(0).toUpperCase()+string.slice(1)}
function terminalUpdate(content){
	TERMINAL.innerHTML+=content
	window.scrollTo(0,document.body.scrollHeight)}