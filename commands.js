let data={}
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
COMMANDS.root.upload=`Upload a memory file for data use.`
function commandUpload(){
	terminalUpdate(`<p class="feedback">File upload initiated...</p>`)
	const fileInput=Object.assign(document.createElement(`input`),{
		type:`file`,
		accept:`.json`,
		style:`display:none`,
		onchange:(e)=>{
			const reader=new FileReader()
			reader.onload=(e)=>{
				data=JSON.parse(e.target.result)
				console.log(data)
				terminalUpdate(`<p class="feedback">File upload successful.</p>`)}
			reader.readAsText(e.target.files[0])
			document.body.removeChild(fileInput)},
		oncancel:(e)=>{
			terminalUpdate(`<p class="feedback">File upload aborted, user action.</p>`)
			document.body.removeChild(fileInput)}})
	document.body.appendChild(fileInput)
	fileInput.click()}
COMMANDS.root.download=`Download a memory file for data storage.`
function commandDownload(){
	if(!Object.keys(data).length){
		terminalUpdate(`<p class="feedback">File download aborted, no data.</p>`)
		return}
	const file=new Blob(
		[JSON.stringify(data)],
		{type:`application/json`})
	const link=Object.assign(document.createElement(`a`),{
		href:URL.createObjectURL(file),
		download:`Life CLI.json`})
	link.click()
	URL.revokeObjectURL(link.href)
	terminalUpdate(`<p class="feedback">File download initialised...</p>`)}