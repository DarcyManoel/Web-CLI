const commands={}
commands.clear=function(){
	terminal.innerHTML=``
}
commands.upload=function(){
	terminalBacklogFeedback.push(`<p>File upload initiated.`)
	const fileInput=document.createElement(`input`)
	fileInput.type=`file`
	fileInput.accept=`.json`
	fileInput.style.display=`none`
	fileInput.onchange=(e)=>{
		const reader=new FileReader()
		reader.onload=()=>{
			data=JSON.parse(reader.result)
			terminalBacklogFeedback.push(`<p>File upload completed.`)
			terminalBacklogFeedback.push(`<p>Data last updated on ${formatDate(data.lastUpdated)}. <span class="subtle-element">(${getDaysSince(data.lastUpdated)})`)
			terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
			Object.keys(data.funds).length
				?terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)">funds.table()`)
				:terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)">funds.new(`)
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
commands.download=function(){
	if(!Object.keys(data.funds).length){
		terminalBacklogFeedback.push(`<p>File download blocked, no data to download.`)
		terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
		terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)">upload()`)
		return
	}
	const file=new Blob([JSON.stringify(data)],{type:`application/json`})
	const link=document.createElement(`a`)
	link.href=URL.createObjectURL(file)
	link.download=`Web-CLI data.json`
	link.click()
	URL.revokeObjectURL(link.href)
	terminalBacklogFeedback.push(`<p>File download initialised.`)
}
commands.funds={}
commands.funds.table=function(){
	if(!Object.keys(data.funds).length){
		terminalBacklogFeedback.push(`<p>Render aborted, no funds data to render.`)
		terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
		terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)">funds.new(`)
		return
	}
	terminalBacklogFeedback.push(`<p>Rendering funds table.`)
	terminalBacklogFeedback.push(`<table></table>`)
	for(const[key,value]of Object.entries(data.funds)){
		try{
			const recordsLastKey=Object.keys(value.records).pop()
			const recordsLastValue=value.records[recordsLastKey]
			const balance=recordsLastValue.balance
			terminalBacklogFeedback.push({tag:`table`,insert:`
				<tr>
					<td>${key}</td>
					<td style="text-align:right;">$${separateThousands(balance.toFixed(2))}</td>
				</tr>
			`})
		}
		catch{
			terminalBacklogFeedback.push({tag:`table`,insert:`
				<tr>
					<td>${key}</td>
					<td style="text-align:right;">$0.00</td>
				</tr>
			`})
		}
	}
	terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
	terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)">funds.update(`)
}
commands.funds.update=function(account,balance,date){
	//	account parameter checks
	if(!account){
		if(!Object.keys(data.funds).length){
			terminalBacklogFeedback.push(`<p>There are no accounts saved.`)
			terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
			terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)">funds.new(`)
			return
		}
		terminalBacklogFeedback.push(`<p>No account specified.`)
		terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
		for(const account in data.funds){
			terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)"><span class="subtle-element">funds.update(</span>${account}<span class="subtle-element">,</span>`)
		}
		return
	}
	if(!data.funds[account]){
		terminalBacklogFeedback.push(`<p>Account '${account}' does not exist.`)
		terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
		terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)"><span class="subtle-element">funds.update(</span>${account}`)
		terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)"><span class="subtle-element">funds.new(</span>${account}`)
		return
	}
	//	balance parameter checks
	if(!balance){
		terminalBacklogFeedback.push(`<p>Account '${account}' cannot be updated without a balance.`)
		terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
		terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)"><span class="subtle-element">funds.update(</span>${account}<span class="subtle-element">,</span>`)
		return
	}
	if(isNaN(+balance)){
		terminalBacklogFeedback.push(`<p>Account '${account}' cannot be updated with balance '${balance}'.`)
		terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
		terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)"><span class="subtle-element">funds.update(</span>${account}<span class="subtle-element">,</span>`)
		return
	}
	//	date parameter checks
	if(date){
		let suggestedCommands=function(){
			terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
			terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)"><span class="subtle-element">funds.update(</span>${account}<span class="subtle-element">,</span>${balance}<span class="subtle-element">,</span>`)
		}
		if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){
			terminalBacklogFeedback.push(`<p>Date format is invalid.`)
			suggestedCommands()
			return
		}
		if(new Date(date)==`Invalid Date`){
			terminalBacklogFeedback.push(`<p>Date value is invalid.`)
			suggestedCommands()
			return
		}
	}
	//	execution
	balance=parseFloat(balance)
	data.funds[account].records[date||getDateToday()]={
		balance
	}
	data.lastUpdated=getDateToday()
	terminalBacklogFeedback.push(`<p>Account <span onclick="setInput('funds.update(${account},')">'${account}'</span></span> updated on date: ${date||getDateToday()} with balance: $${balance.toFixed(2)}`)
	terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
	terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)">funds.table()`)
}
commands.funds.new=function(account){
	if(account==undefined){
		terminalBacklogFeedback.push(`<p>Cannot create account with no given name.`)
		terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
		terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)">funds.new(`)
		return
	}
	data.funds[account]={
		records:{}
	}
	terminalBacklogFeedback.push(`<p>New account '${account}' created.`)
	terminalBacklogFeedback.push(`<p class="suggested-commands-opener">Suggested commands:`)
	terminalBacklogFeedback.push(`<p onclick="setInput(this.innerText)"><span class="subtle-element">funds.update(</span>${account}<span class="subtle-element">,</span>`)
	data.lastUpdated=getDateToday()
}
//	command auto-complete
const commandsSuggestions=[]
for(const[key,value]of Object.entries(commands)){
	if(typeof value==`object`){
		for(const[key2,value2]of Object.entries(value)){
			commandsSuggestions.push(`${key}.${key2}`)
		}
		continue
	}
	commandsSuggestions.push(`${key}`)
}