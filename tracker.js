(function() {
    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    let external_id = localStorage.getItem('lead_external_id');
    if (!external_id) {
        external_id = generateId();
        localStorage.setItem('lead_external_id', external_id);
    }

    let hasClickedCheckout = false;

    // Supabase Credentials
    const SUPABASE_URL = 'https://vqhwyaykazswdznudurt.supabase.co/rest/v1/leads';
    const SUPABASE_KEY = 'sb_publishable_FlLfU-LZY825I9Hz8JvXfg_VSBWFOmY';

    function sendTracking() {
        const payload = {
            external_id: external_id,
            last_page: window.location.pathname.split('/').pop() || 'index.html',
            nome: localStorage.getItem('nome') || '',
            email: localStorage.getItem('email') || '',
            telefone: localStorage.getItem('phone') || localStorage.getItem('telefone') || localStorage.getItem('celular') || '',
            checkout_clicked: hasClickedCheckout,
            updated_at: new Date().toISOString()
        };
        
        if (payload.last_page.includes('22') || payload.last_page.includes('23')) {
            payload.finished = true;
        }

        // Use Supabase REST API directly for maximum performance (no heavy libraries needed)
        fetch(SUPABASE_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                // This tells Supabase to UPSERT (update if external_id exists, insert if not)
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(payload),
            keepalive: true
        }).catch(e => console.error('Error tracking to Supabase:', e));
    }

    // Send immediately on page load
    sendTracking();

    // Hook into clicks on links or buttons to capture form data right before they leave
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a') || e.target.closest('button');
        if (target) {
            // Check if it's a checkout button
            if (target.hasAttribute('data-checkout') || (target.href && target.href.includes('checkout-produto'))) {
                hasClickedCheckout = true;
            }
            
            // Persist UTMs across standard link clicks (e.g. from inicio2.html to pagina1.html)
            if (target.tagName.toLowerCase() === 'a' && target.href && target.origin === window.location.origin) {
                const currentQuery = window.location.search;
                if (currentQuery) {
                    try {
                        const url = new URL(target.href);
                        if (!url.hash || url.pathname !== window.location.pathname) {
                            const params = new URLSearchParams(currentQuery);
                            params.forEach((value, key) => {
                                if (!url.searchParams.has(key)) {
                                    url.searchParams.set(key, value);
                                }
                            });
                            target.href = url.toString();
                        }
                    } catch(err) {}
                }
            }
            
            // Give localStorage a brief moment to update if a script does it onClick
            setTimeout(sendTracking, 100);
        }
    });

    // Also track right before unload just in case
    window.addEventListener('beforeunload', sendTracking);
})();
