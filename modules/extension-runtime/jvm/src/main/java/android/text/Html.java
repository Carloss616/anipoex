package android.text;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.NodeVisitor;

/** Html.fromHtml as plain text: tags are dropped, br and block ends become line breaks. */
public final class Html {
    private Html() {}

    public static Spanned fromHtml(String source) {
        return fromHtml(source, 0);
    }

    public static Spanned fromHtml(String source, int flags) {
        StringBuilder out = new StringBuilder();
        Jsoup.parseBodyFragment(source).body().traverse(new NodeVisitor() {
            @Override
            public void head(Node node, int depth) {
                if (node instanceof TextNode text) out.append(text.text());
                else if (node instanceof Element el && el.normalName().equals("br")) out.append('\n');
            }

            @Override
            public void tail(Node node, int depth) {
                if (!(node instanceof Element el)) return;
                switch (el.normalName()) {
                    case "p" -> out.append("\n\n");
                    case "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6" -> out.append('\n');
                    default -> {}
                }
            }
        });
        // shortcut: trailing breaks are trimmed (Android keeps them) and no styling survives, until an extension reads spans.
        int end = out.length();
        while (end > 0 && out.charAt(end - 1) == '\n') end--;
        return new Text(out.substring(0, end));
    }

    private record Text(String value) implements Spanned {
        @Override
        public int length() {
            return value.length();
        }

        @Override
        public char charAt(int index) {
            return value.charAt(index);
        }

        @Override
        public CharSequence subSequence(int start, int end) {
            return value.subSequence(start, end);
        }

        @Override
        public String toString() {
            return value;
        }
    }
}
