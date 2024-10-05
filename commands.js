const COMMANDS={
	root:{}}
let commandsDirectory=`root`
//	root
COMMANDS.root.help=`Lists all available commands at the active directory.`
function commandHelp(){
	let contentQueue=`<p><table class="feedback">`
	for(const[key,value]of Object.entries(COMMANDS.root)){
		contentQueue+=`<tr><td class="command" onclick="runCommandFromKey(1,this.innerHTML)">${key}</td><td>${value}</td></tr>`
	}
	contentQueue+=`</table></p>`
	terminalUpdate(contentQueue)}