((script, init) => {
    const tagname = script.dataset.tagname || 'common-mark';
    if (customElements.get(tagname)) {
        return;
    }
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    const cmarked = (() => {
        const reader = new commonmark.Parser();
        const writer = new commonmark.HtmlRenderer();
        return (md) => {
            const parsed = reader.parse(md);
            return writer.render(parsed);
        };
    })();
    ((component, tagname = 'common-mark') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; width: 100%; height: fit-content; }',
            ].join('');
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    switch (mutation.type) {
                        case 'childList':
                            return this.onUpdateChildList(mutation);
                    }
                });
            });
            observer.observe(this, { childList: true });
            shadow.appendChild(style);
            shadow.appendChild(document.createElement('slot'));
            this.onUpdateSource();
        }
        onUpdateChildList(mutation) {
            if (mutation.addedNodes.length !== 1 || mutation.addedNodes[0].nodeName !== '#text') {
                return;
            }
            this.onUpdateSource();
        }
        onUpdateSource() {
            this.innerHTML = cmarked(this.textContent || '');
            this.dispatchEvent(new CustomEvent('change'));
        }
        onUpdateSrc(value) {
            if (!value) {
                return;
            }
            fetch(value).then((result) => {
                if (result.ok) {
                    return result.text();
                }
                return result.text().then((result) => {
                    throw result;
                });
            }).then((md) => {
                this.textContent = md;
                this.dispatchEvent(new CustomEvent('load'));
            }).catch((error) => {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
            });
        }
        get src() {
            return this.getAttribute('src') || '';
        }
        set src(value) {
            this.setAttribute('src', value || '');
        }
        get force() {
            return this.hasAttribute('force');
        }
        set force(value) {
            if (!value) {
                this.removeAttribute('force');
            }
            else {
                this.setAttribute('force', '');
            }
        }
        static get observedAttributes() {
            return ['src'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal && !this.force) {
                return;
            }
            switch (attrName) {
                case 'src':
                    this.onUpdateSrc(newVal);
                    break;
            }
        }
    }, script.dataset.tagname);
});
