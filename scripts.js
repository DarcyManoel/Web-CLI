let data={
	funds:{},
	lastUpdated:``
}
const input=document.getElementById(`input`)
const inputReflection=document.getElementById(`input-reflection`)
const inputSuggestion=document.getElementById(`input-suggestion`)
//	input
function inputKeyDown(key,event){
	input.setSelectionRange(input.value.length,input.value.length)
	if(!input.value.length){
		return
	}
	switch(event.keyCode){
		case 9://tab
			event.preventDefault()
			if(inputSuggestion.innerHTML.length){
				input.value=`${input.value}${inputSuggestion.innerHTML}`
				inputReflection.innerHTML=input.value
				inputSuggestion.innerHTML=``
			}
			break
		case 13://enter/return
			submitCommand(key)
			break
	}
}
function inputCommand(key){
	inputReflection.innerHTML=key
	inputReflection.innerHTML=(inputReflection.innerHTML
		.replace(/\(/,`<span class="command-arguments">(<span class="subtle-element">`)
		.replace(/,/g,`</span>,<span class="subtle-element">`)
		.replace(/\)/,`</span>)`)
	)
	window.scrollTo(0,document.body.scrollHeight)
	if(!key.length||key==inputSuggestion.innerHTML){
		inputSuggestion.innerHTML=``
		return
	}
	inputSuggestion.innerHTML=``
	for(let i=0;i<commandsSuggestions.length;i++){
		if(commandsSuggestions[i].startsWith(key)){
			inputSuggestion.innerHTML=commandsSuggestions[i].replace(key,``)
			break
		}
	}
}
function setInput(newInput){
	input.value=newInput
	inputCommand(input.value)
	input.focus()
	input.setSelectionRange(input.value.length,input.value.length)
}
const feedbackLost=`<span class="feedback-lost">Command not found.`
function submitCommand(key){
	input.value=``
	inputReflection.innerHTML=``
	inputSuggestion.innerHTML=``
	const keys=key.replace(/\)/,``).split(/[(,]/)
	const command=keys[0].split(`.`)
	const args=keys.splice(1,keys.length)
	terminalBacklogCommand.push(`<span class="subtle-element">root:</span> ${command.join(`.`)}<span class="command-arguments">(<span class="subtle-element">${args.join(`</span>,<span class="subtle-element">`)}</span>)</span>`)
	try{
		commands[command[0]](...args)
	}
	catch{
		try{
			commands[command[0]][command[1]](...args)
		}
		catch{
			terminalBacklogFeedback.push(`<p>${feedbackLost}`)
		}
	}
}
//	output
const terminal=document.getElementById(`terminal`)
const terminalBacklogCommand=[]
const terminalBacklogFeedback=[]
terminalBacklogFeedback.push(`<p><span class="feedback-landing">Welcome to this interactive web terminal.`)
setInterval(terminalUpdate,100,terminalBacklogCommand,terminalBacklogFeedback)
function terminalUpdate(command,feedback){
	if(command.length){
		terminal.insertAdjacentHTML(`beforeend`,`<p class="command">${command[0]}`)
		command.shift()
		window.scrollTo(0,document.body.scrollHeight)
	}
	if(feedback.length){
		switch(typeof feedback[0]){
			case`string`:
				terminal.insertAdjacentHTML(`beforeend`,`${feedback[0]}`)
				break
			case`object`:
				const taggedElements=document.getElementsByTagName(feedback[0].tag)
				taggedElements[taggedElements.length-1].insertAdjacentHTML(`beforeend`,`${feedback[0].insert}`)
				break
		}
		feedback.shift()
		window.scrollTo(0,document.body.scrollHeight)
	}
}
//	commands
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
		if(!data.funds){
			terminalBacklogFeedback.push(`<p>Render aborted, no funds data to render.`)
			return
		}
		terminalBacklogFeedback.push(`<p>Rendering funds table.`)
		terminalBacklogFeedback.push(`<table></table>`)
		for(const[key,value]of Object.entries(data.funds)){
			const recordsLastKey=Object.keys(value.records).pop()
			const recordsLastValue=value.records[recordsLastKey]
			const balance=recordsLastValue.balance
			const balanceIntLength=separateThousands(balance).split(`.`)[0].length
			terminalBacklogFeedback.push({tag:`table`,insert:`
				<tr>
					<td>${key}</td>
					<td style="text-align:right;">$${separateThousands(balance).padEnd(balanceIntLength+3,`.00`)}</td>
				</tr>
			`})
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
		terminalBacklogFeedback.push(`<p>Which account needs to be updated?`)
		for(const account in data.funds){
			terminalBacklogFeedback.push(`<p onclick="setInput('funds.update(${account},')">'${account}'`)
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
	balance=+balance
	data.funds[account].records[date||getDateToday()]={
		balance
	}
	data.lastUpdated=getDateToday()
	terminalBacklogFeedback.push(`<p>Account <span onclick="setInput('funds.update(${account},')">'${account}'</span></span> updated on date: ${date||getDateToday()} with balance: $${balance}`)
	console.log(data.funds[account])//	temp
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
//	tools
function formatDate(dateStr){
	const months=[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`]
	const [year,month,day]=dateStr.split(`-`)
	const daySuffix=day.endsWith(`1`)&&day!==`11`
		?`st`
		:day.endsWith(`2`)&&day!==`12`
			?`nd`
			:day.endsWith(`3`)&&day!==`13`
				?`rd`
				:`th`
	return `${parseInt(day)}${daySuffix} ${months[parseInt(month)-1]} ${year}`
}
function getArgumentNames(func){
	const args=func.toString().match(/\(([^)]*)\)/)[1]
	return args.split(`,`).map(arg=>arg.trim())
}
function getDateToday(){
	const today=new Date()
	const year=today.getFullYear()
	const month=(today.getMonth()+1).toString().padStart(2,'0')
	const day=today.getDate().toString().padStart(2,'0')
	return `${year}-${month}-${day}`
}
function getDaysSince(dateStr){
	const now=new Date()
	const date=new Date(dateStr)
	const diff=Math.round((now-date)/86400000)
	return diff==0
		?`today`
		:diff==1
			?`1 day ago`
			:`${diff} days ago`
}
function separateThousands(int){
	return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g,`,`)
}