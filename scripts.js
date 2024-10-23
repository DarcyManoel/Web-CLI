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
	for(let i=0;i<commandsSuggestions.length;++i){
		if(commandsSuggestions[i].startsWith(key)){
			inputSuggestion.innerHTML=commandsSuggestions[i].replace(key,``)
			break
		}
	}
}
function setInput(newInput){
	input.value=newInput
	inputCommand(input.value)
	input
		.focus()
		.setSelectionRange(input.value.length,input.value.length)
}
const feedbackLost=`<span class="feedback-lost">Command not found.`
function submitCommand(key){
	input.value=``
	inputReflection.innerHTML=``
	inputSuggestion.innerHTML=``
	const keys=key
		.replace(/\)/,``)
		.split(/[(,]/)
	const command=keys[0].split(`.`)
	const args=keys.splice(1,keys.length)
	terminalBacklogCommand.push(`${command.join(`.`)}<span class="command-arguments">(<span class="subtle-element">${args.join(`</span>,<span class="subtle-element">`)}</span>)</span>`)
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
terminal.insertAdjacentHTML(`beforeend`,`<p><span class="feedback-landing">Welcome to this interactive web terminal.`)
setInterval(terminalUpdate,100,terminalBacklogCommand,terminalBacklogFeedback)
function terminalUpdate(command,feedback){
	if(command.length){
		terminal.insertAdjacentHTML(`beforeend`,`<details open><summary><span class="subtle-element">root:</span> ${command[0]}`)
		command.shift()
		window.scrollTo(0,document.body.scrollHeight)
	}
	if(feedback.length){
		switch(typeof feedback[0]){
			case`string`:
				terminal.children[terminal.children.length-1].insertAdjacentHTML(`beforeend`,`${feedback[0]}`)
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
	const args=func
		.toString()
		.match(/\(([^)]*)\)/)[1]
	return args
		.split(`,`)
		.map(arg=>arg.trim())
}
function getDateToday(){
	const today=new Date()
	const year=today.getFullYear()
	const month=(today.getMonth()+1)
		.toString()
		.padStart(2,'0')
	const day=today
		.getDate()
		.toString()
		.padStart(2,'0')
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
	return int
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g,`,`)
}