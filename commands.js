const commands={}
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
	const hasData=Object.keys(data).length
	if(!hasData){
		terminalBacklogFeedback.push(`<p>File download blocked, no data to download.`)
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
	try{
		if(!Object.keys(data.funds).length){
			terminalBacklogFeedback.push(`<p>Render aborted, no funds data to render.`)
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
	}
	catch{
		terminalBacklogFeedback.splice(-2,2)
		terminalBacklogFeedback.push(`<p><span class="feedback-lost">Command failed, something went wrong.`)
	}
}
commands.funds.update=function(account,balance,date){
	//	account parameter checks
	if(account===undefined){
		if(!Object.keys(data.funds).length){
			terminalBacklogFeedback.push(`<p>There are no accounts saved.`)
			return
		}
		terminalBacklogFeedback.push(`<p>Which account needs to be updated?`)
		for(const account in data.funds){
			terminalBacklogFeedback.push(`<p class="insert-command" onclick="setInput('funds.update(${account},')">'${account}'`)
		}
		return
	}
	if(!data.funds[account]){
		terminalBacklogFeedback.push(`<p>Account '${account}' does not exist.`)
		return
	}
	//	balance parameter checks
	if(!balance){
		terminalBacklogFeedback.push(`<p>Account '${account}' cannot be updated without a balance.`)
		return
	}
	if(isNaN(+balance)){
		terminalBacklogFeedback.push(`<p>Account '${account}' cannot be updated with balance '${balance}'.`)
		return
	}
	//	date parameter checks
	if(date){
		if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){
			terminalBacklogFeedback.push(`<p>Date format is invalid.`)
			return
		}
		if(new Date(date)==`Invalid Date`){
			terminalBacklogFeedback.push(`<p>Date value is invalid.`)
			return
		}
	}
	//	execution
	balance=parseFloat(balance)
	data.funds[account].records[date||getDateToday()]={
		balance
	}
	terminalBacklogFeedback.push(`<p>Account <span onclick="setInput('funds.update(${account},')">'${account}'</span></span> updated on date: ${date||getDateToday()} with balance: $${balance.toFixed(2)}`)
	data.lastUpdated=getDateToday()
}
commands.funds.new=function(name){
	if(name==undefined){
		terminalBacklogFeedback.push(`<p>Cannot create account with no given name. <span class="insert-command" onclick="setInput('funds.new(')">Try again?`)
		return
	}
	data.funds[name]={
		records:{}
	}
	terminalBacklogFeedback.push(`<p>New account '${name}' created.`)
	terminalBacklogFeedback.push(`<p>Update account <span class="insert-command" onclick="setInput('funds.update(${name},')">'${name}'</span> with an initial balance?`)
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