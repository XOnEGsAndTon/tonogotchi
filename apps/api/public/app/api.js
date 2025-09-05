(function(){
	const base = '/api';
	async function request(path, method='GET', body){
		const res = await fetch(base+path, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
		if (!res.ok) throw new Error(await res.text());
		return res.json();
	}
	window.api = {
		getPet: (addr) => request(`/pet/${encodeURIComponent(addr)}`),
		care: (addr, type) => request(`/pet/${encodeURIComponent(addr)}/care`, 'POST', { type }),
		rhythmStart: (tgId, petAddr) => request('/games/rhythm/start','POST',{ tgId, petAddr }),
		rhythmSubmit: (sessionId, hits) => request('/games/rhythm/submit','POST',{ sessionId, hits }),
	};
})();