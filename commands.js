const COMMANDS={}
let commandsDirectory=``
COMMANDS.help={
	description:`Lists all available commands at the active directory.`,
	function:(function(){
		let contentQueue=`<table class="feedback">`
		for(const[key,value]of Object.entries(COMMANDS)){
			contentQueue+=`<tr><td class="command" onclick="terminalUpdate(1,this.innerHTML),COMMANDS[this.innerHTML].function()">${key}</td><td>${value.description}</td></tr>`
		}
		contentQueue+=`</table>`
		terminalUpdate(0,contentQueue)})}
COMMANDS.upload={
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
				document.body.removeChild(fileInput)},
			oncancel:(e)=>{
				terminalUpdate(0,`<p class="feedback">File upload aborted, user action.</p>`)
				document.body.removeChild(fileInput)}})
		document.body.appendChild(fileInput)
		fileInput.click()}}
COMMANDS.download={
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
		terminalUpdate(0,`<p class="feedback">File download initialised...</p>`)}}