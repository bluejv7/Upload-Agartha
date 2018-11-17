//@flow
import autobind from 'autobind-decorator';
import * as mobx from 'mobx';
import * as mobxreact from 'mobx-react';
import React from 'react';
import sanitizeHtml from 'sanitize-html-react';

@autobind
@mobxreact.observer
export default class MakePost extends React.Component<{}> {
    @mobx.observable content = '';
    @mobx.observable location = '';
    @mobx.observable mood = '';
    @mobx.observable outfit = '';
    @mobx.observable with = '';

    getContent() {
        let content = this.content || '(content here)';
        return content;
    }

    getHeader() {
        let mood = this.mood || '(put mood here)';
        let location = this.location || '(location here)';
        let outfit = this.outfit || '(outfit here)';
        let withTag = this.with || '(tag whoever you are interacting with)';
        let header = `**Mood:** ${mood} || ** Location:** ${location} || **Outfit:** ${outfit} || **With:** ${withTag}`;
        return header;
    }

    onCopy() {
        let copy = this.getHeader() + '\n\n' + this.getContent();
        let textarea = document.createElement('textarea');
        textarea.value = copy;

        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    preview() {
        let preview = this.getHeader() + '\n\n' + this.getContent();
        preview = this._sanitize(preview);

        preview = this._replaceNewlines(preview);
        preview = preview.replace(/\*\*\*([^\b]|[^\b].*?[^\b])\*\*\*/g, '<b><i>$1</i></b>');
        preview = preview.replace(/\*\*([^\b]|[^\b].*?[^\b])\*\*/g, '<b>$1</b>');
        preview = preview.replace(/\*([^\b]|[^\b].*?[^\b])\*/g, '<i>$1</i>');

        preview = preview.replace(/`(.*?)<b>(.*?)<\/b>(.*?)`/g, '`$1**$2**$3`');
        preview = preview.replace(/`(.*?)<i>(.*?)<\/i>(.*?)`/g, '`$1*$2*$3`');
        preview = preview.replace(/```(<br\/>)*(.+?)```/g, '<div class="code-block">$2</div>');
        preview = preview.replace(/`(.+?)`/g, '<span class="code">$1</span>');
        return preview;
    }

    render() {
        return (
            <div className="cmp-make-post">
                <div className="header">
                    <input
                        autoFocus={true}
                        onChange={event => this.mood = event.currentTarget.value}
                        placeholder="Mood"
                        type="text"
                        value={this.mood}
                    />
                    <input
                        onChange={event => this.location = event.currentTarget.value}
                        placeholder="Location"
                        type="text"
                        value={this.location}
                    />
                    <input
                        onChange={event => this.outfit = event.currentTarget.value}
                        placeholder="Outfit"
                        type="text"
                        value={this.outfit}
                    />
                    <input
                        onChange={event => this.with = event.currentTarget.value}
                        placeholder="With"
                        type="text"
                        value={this.with}
                    />

                    <div className="content">
                        <textarea onChange={event => this.content = event.currentTarget.value} value={this.content} />
                    </div>
                </div>

                <div className="preview">
                    <div>Preview</div>
                    <div dangerouslySetInnerHTML={{__html: this.preview()}}></div>
                </div>

                <div className="copy">
                    <button onClick={this.onCopy} style={{display: 'block'}}>Copy this</button>
                    {this.getHeader()}
                    <br/><br/>
                    <span dangerouslySetInnerHTML={{__html: this._replaceNewlines(this._sanitize(this.getContent()))}} />
                </div>
            </div>
        );
    }

    _replaceNewlines(text: string) {
        text = text.replace(/\r\n/g, '\n');
        text = text.replace(/\r/g, '\n');
        text = text.replace(/\n/g, '<br/>');
        return text;
    }

    _sanitize(text: string) {
        text = text.replace(/&/g, '&amp;');
        text = text.replace(/</g, '&lt;');
        text = text.replace(/>/g, '&gt;');
        text = sanitizeHtml(text, {allowedTags: false, parser: {decodeEntities: false}});
        return text;
    }
}

