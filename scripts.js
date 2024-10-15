let data={
	funds:{},
	lastUpdated:``
}
const INPUT=document.getElementById(`input`)
const INPUT_REFLECTION=document.getElementById(`input-reflection`)
const INPUT_SUGGESTION=document.getElementById(`input-suggestion`)
//	input
function inputKeyDown(key,event){
	INPUT.setSelectionRange(input.value.length,input.value.length)
	if(!INPUT.value.length){
		return
	}
	switch(event.keyCode){
		case 9://tab
			event.preventDefault()
			if(INPUT_SUGGESTION.innerHTML.length){
				INPUT.value=INPUT_SUGGESTION.innerHTML
				INPUT_REFLECTION.innerHTML=INPUT_SUGGESTION.innerHTML
				INPUT_SUGGESTION.innerHTML=``
			}
			break
		case 13://enter/return
			submitCommand(key)
			break
	}
}
function inputCommand(key){
	INPUT_REFLECTION.innerHTML=key
	window.scrollTo(0,document.body.scrollHeight)
	if(!key.length||key==INPUT_SUGGESTION.innerHTML){
		INPUT_SUGGESTION.innerHTML=``
		return
	}
	INPUT_SUGGESTION.innerHTML=``
	for(let i1=0;i1<COMMANDS_SUGGESTIONS.length;i1++){
		if(COMMANDS_SUGGESTIONS[i1].startsWith(key)){
			INPUT_SUGGESTION.innerHTML=COMMANDS_SUGGESTIONS[i1]
			break
		}
	}
}
const FEEDBACK_LOST=`<span class="feedback-lost">Command not found.`
function submitCommand(key){
	INPUT.value=``
	INPUT_REFLECTION.innerHTML=``
	INPUT_SUGGESTION.innerHTML=``
	let keys=key.replace(/\)/,``).split(/[(,\s]/)
	let command=keys[0].split(`.`)
	let arguments=keys.splice(1,keys.length)
	TERMINAL_BACKLOG_COMMAND.push(`<span class="subtle-element">root:</span> ${command.join(`.`)}<span class="command-arguments">(<span class="subtle-element">${arguments.join(`</span>,<span class="subtle-element">`)}</span>)</span>`)
	try{
		COMMANDS[command[0]](...arguments)
	}
	catch{
		try{
			COMMANDS[command[0]][command[1]](...arguments)
		}
		catch{
			TERMINAL_BACKLOG_FEEDBACK.push(`<p>${FEEDBACK_LOST}`)
		}
	}
}
//	output
const TERMINAL=document.getElementById(`terminal`)
const TERMINAL_BACKLOG_COMMAND=[]
const TERMINAL_BACKLOG_FEEDBACK=[]
TERMINAL_BACKLOG_FEEDBACK.push(`<p><span class="feedback-landing">Welcome to this interactive web terminal.`)
setInterval(terminalUpdate,100,TERMINAL_BACKLOG_COMMAND,TERMINAL_BACKLOG_FEEDBACK)
function terminalUpdate(command,feedback){
	if(command.length){
		TERMINAL.insertAdjacentHTML(`beforeend`,`<p class="command">${command[0]}`)
		command.shift()
		window.scrollTo(0,document.body.scrollHeight)
	}
	if(feedback.length){
		switch(typeof feedback[0]){
			case`string`:
				TERMINAL.insertAdjacentHTML(`beforeend`,`${feedback[0]}`)
				break
			case`object`:
				const TAGGED_ELEMENTS=document.getElementsByTagName(feedback[0].tag)
				TAGGED_ELEMENTS[TAGGED_ELEMENTS.length-1].insertAdjacentHTML(`beforeend`,`${feedback[0].insert}`)
				break
		}
		feedback.shift()
		window.scrollTo(0,document.body.scrollHeight)
	}
}
//	commands
const COMMANDS={}
COMMANDS.upload=function(){
	TERMINAL_BACKLOG_FEEDBACK.push(`<p>File upload initiated.`)
	const fileInput=document.createElement(`input`)
	fileInput.type=`file`
	fileInput.accept=`.json`
	fileInput.style.display=`none`
	fileInput.onchange=(e)=>{
		const reader=new FileReader()
		reader.onload=()=>{
			data=JSON.parse(reader.result)
			TERMINAL_BACKLOG_FEEDBACK.push(`<p>File upload completed.`)
			TERMINAL_BACKLOG_FEEDBACK.push(`<p>Data last updated on ${formatDate(data.lastUpdated)}. <span class="subtle-element">(${getDaysSince(data.lastUpdated)})`)
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
		TERMINAL_BACKLOG_FEEDBACK.push(`<p>File download blocked, no data to download.`)
		return
	}
	const file=new Blob([JSON.stringify(data)],{type:`application/json`})
	const link=document.createElement(`a`)
	link.href=URL.createObjectURL(file)
	link.download=`Web-CLI data.json`
	link.click()
	URL.revokeObjectURL(link.href)
	TERMINAL_BACKLOG_FEEDBACK.push(`<p>File download initialised.`)
}
COMMANDS.funds={}
COMMANDS.funds.table=function(){
	try{
		if(!data.funds){
			TERMINAL_BACKLOG_FEEDBACK.push(`<p>Render aborted, no funds data to render.`)
			return
		}
		TERMINAL_BACKLOG_FEEDBACK.push(`<p>Rendering funds table.`)
		TERMINAL_BACKLOG_FEEDBACK.push(`<table></table>`)
		for(const[key1,value1]of Object.entries(data.funds)){
			const RECORDS_LAST_KEY=Object.keys(value1.records).pop()
			const RECORDS_LAST_VALUE=value1.records[RECORDS_LAST_KEY]
			const BALANCE=RECORDS_LAST_VALUE.balance
			const BALANCE_INT_LENGTH=separateThousands(BALANCE).split(`.`)[0].length
			TERMINAL_BACKLOG_FEEDBACK.push({tag:`table`,insert:`
				<tr>
					<td>${key1}</td>
					<td style="text-align:right;">$${separateThousands(BALANCE).padEnd(BALANCE_INT_LENGTH+3,`.00`)}</td>
				</tr>
			`})
		}
	}
	catch{
		TERMINAL_BACKLOG_FEEDBACK.splice(-2,2)
		TERMINAL_BACKLOG_FEEDBACK.push(`<p><span class="feedback-lost">Command failed, something went wrong.`)
	}
}

COMMANDS.funds.update=function(account,balance,date){
	if(!data.funds[account]){
		TERMINAL_BACKLOG_FEEDBACK.push(`<p>Account '${account}' does not exist.`)
		return
	}
	if(!balance){
		TERMINAL_BACKLOG_FEEDBACK.push(`<p>Account '${account}' can not be updated without a balance.`)
		return
	}
	if(!date){
		console.log(getDateToday())
		data.funds[account].records[getDateToday()]={
			balance
		}
		data.lastUpdated=getDateToday()
	}
}
//	command auto-complete
const COMMANDS_SUGGESTIONS=[]
for(const[key1,value1]of Object.entries(COMMANDS)){
	if(typeof value1==`object`){
		for(const[key2,value2]of Object.entries(value1)){
			COMMANDS_SUGGESTIONS.push(`${key1}.${key2}`)
		}
		continue
	}
	COMMANDS_SUGGESTIONS.push(`${key1}`)
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