declare const commonmark: {
    Parser: {
        new (): {
            parse(input: string): Node;
        };
    };
    HtmlRenderer: {
        new (): {
            render(root: Node): string;
        };
    };
};
interface CommonMarkElement extends HTMLElement {
    src: string;
}
