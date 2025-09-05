(function(){
	const $ = (s) => document.querySelector(s);
	const content = $('#content');
	const tabs = Array.from(document.querySelectorAll('.tab'));
	let tgUserId = '';
	try { tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || ''; } catch {}

	function setView(v){
		tabs.forEach(b=>b.classList.toggle('ring-2', b.dataset.view===v));
		if(v==='pet') renderPet();
		else if(v==='care') renderCare();
		else if(v==='breed') renderBreed();
		else if(v==='games') renderGames();
		else if(v==='clans') renderClans();
		else if(v==='market') renderMarket();
	}

	function addrField(){
		return `<div class="flex gap-2 items-center"><input id="addr" class="flex-1 bg-[#17212b] border border-[#111921] rounded-lg px-3 py-2" placeholder="NFT address"/><button id="load" class="px-3 py-2 rounded-lg bg-card hover:bg-card/80">Загрузить</button></div>`;
	}

	async function renderPet(){
		content.innerHTML = `
			${addrField()}
			<div id="petBox" class="mt-3 text-sm text-muted">—</div>
		`;
		const loadAndRender = (r) => {
			if(r.error){ $('#petBox').textContent = 'Ошибка: '+r.error; return; }
			const s = r.status;
			$('#petBox').innerHTML = `
				<div class="grid grid-cols-2 gap-2">
					<div class="p-3 rounded-lg bg-card/60">
						<div class="text-xs text-muted">Возраст</div>
						<div class="text-lg">${s.ageDays} дн</div>
					</div>
					<div class="p-3 rounded-lg bg-card/60">
						<div class="text-xs text-muted">Множитель</div>
						<div class="text-lg">× ${s.multiplier.toFixed(2)}</div>
					</div>
					<div class="p-3 rounded-lg bg-card/60">
						<div class="text-xs text-muted">Сегодня</div>
						<div class="text-lg">${s.earnedToday} / ${s.capLeft + s.earnedToday}</div>
					</div>
					<div class="p-3 rounded-lg bg-card/60">
						<div class="text-xs text-muted">Дедлайн ухода</div>
						<div class="text-lg">${new Date(s.neglectDeadlineAt).toLocaleString()}</div>
					</div>
				</div>
			`;
		};
		if(tgUserId){
			const r = await window.api.getTestPet(tgUserId).catch(e=>({error:e.message}));
			loadAndRender(r);
		}
		$('#load').onclick = async () => {
			const a = $('#addr').value.trim(); if(!a) return;
			const r = await window.api.getPet(a).catch(e=>({error:e.message}));
			loadAndRender(r);
		};
	}

	function renderCare(){
		content.innerHTML = `
			${addrField()}
			<div class="flex gap-2 mt-3">
				<select id="careType" class="flex-1 bg-[#17212b] border border-[#111921] rounded-lg px-3 py-2">
					<option value="feed">Покормить</option>
					<option value="bath">Искупать</option>
					<option value="sleep">Уложить спать</option>
					<option value="play">Поиграть</option>
				</select>
				<button id="care" class="px-3 py-2 rounded-lg bg-card hover:bg-card/80">Отправить</button>
			</div>
			<div id="careRes" class="mt-2 text-sm text-muted">—</div>
		`;
		$('#care').onclick = async () => {
			const type = $('#careType').value;
			let r;
			const a = $('#addr').value.trim();
			if(a) r = await window.api.care(a, type).catch(e=>({error:e.message}));
			else if (tgUserId) r = await window.api.testCare(tgUserId, type).catch(e=>({error:e.message}));
			else r = { error: 'no_target' };
			$('#careRes').textContent = r.ok? 'OK' : ('Ошибка: '+(r.error||'fail'));
		};
	}

	let sessionId = null, pattern = null, hits = [];
	function renderGames(){
		content.innerHTML = `
			${addrField()}
			<div class="mt-3 grid grid-cols-2 gap-2">
				<button id="startRh" class="px-3 py-2 rounded-lg bg-card hover:bg-card/80">Старт ритм-игры</button>
				<button id="submitRh" class="px-3 py-2 rounded-lg bg-card hover:bg-card/80">Отправить</button>
			</div>
			<div id="pads" class="grid grid-cols-4 gap-2 mt-3"></div>
			<div id="rhInfo" class="mt-2 text-sm text-muted">—</div>
		`;
		const pads = $('#pads');
		function renderPads(len=16){
			pads.innerHTML='';
			for(let i=0;i<len;i++){
				const b=document.createElement('button');
				b.className='h-12 rounded-lg border border-[#111921] bg-[#1a2430] text-[#9ecbff]';
				b.textContent=(i+1);
				b.onclick=()=>{ b.classList.add('bg-[#2a3a4c]'); hits.push(performance.now()-window.rhStartAt); };
				pads.appendChild(b);
			}
		}
		$('#startRh').onclick = async () => {
			const a = $('#addr').value.trim(); if(!a) return;
			const r = await window.api.rhythmStart(tgUserId||'web', a).catch(e=>({error:e.message}));
			if(r.sessionId){ sessionId = r.sessionId; pattern = r.pattern; $('#rhInfo').textContent = `BPM ${pattern.bpm}, тактов ${pattern.len}`; renderPads(pattern.len); window.rhStartAt = performance.now(); hits=[]; }
			else $('#rhInfo').textContent='Ошибка старта';
		};
		$('#submitRh').onclick = async () => {
			if(!sessionId){ $('#rhInfo').textContent='Нет активной сессии'; return; }
			const r = await window.api.rhythmSubmit(sessionId, hits).catch(e=>({error:e.message}));
			$('#rhInfo').textContent = r.pointsAwarded!==undefined ? `+${r.pointsAwarded} очков, множ.: ${r.multiplier?.toFixed?.(2) || '—'}, осталось: ${r.capLeft}` : ('Ошибка: '+(r.error||r.message||'fail'));
		};
	}

	function renderBreed(){
		content.innerHTML = `<div class="text-sm text-muted">UI скрещивания в MVP: сюда добавим выбор пары и таймеры.</div>`;
	}
	function renderClans(){ content.innerHTML = `<div class="text-sm text-muted">Кланы: эмблемы, бафы, задания (MVP+1).</div>`; }
	function renderMarket(){ content.innerHTML = `<div class="text-sm text-muted">Маркет: кнопка-листинг в Getgems/Disintar (deeplink).</div>`; }

	document.addEventListener('click', (e)=>{
		const t = e.target.closest('.tab');
		if(t) setView(t.dataset.view);
	});
	setView('pet');
})();