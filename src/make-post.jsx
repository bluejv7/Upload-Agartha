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
    cookie: ?Cookie;
    @mobx.observable currentPostName = 'post: ';
    @mobx.observable location = '';
    @mobx.observable mood = '';
    @mobx.observable outfit = '';
    @mobx.observable postIndex = 0;
    posts = mobx.observable([]);
    @mobx.observable with = '';

    componentDidMount() {
        this.cookie = new Cookie(document.cookie);
        this.posts.replace(this.cookie.posts);
        if (this.posts.length == 0)
            this.onPostNew();

        this.loadPost();
    }

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

    loadPost() {
        let post = this.posts[this.postIndex];
        if (!post)
            return;

        let content = post.content;
        this.content = content.content;
        this.currentPostName = post.name;
        this.location = content.location;
        this.mood = content.mood;
        this.outfit = content.outfit;
        this.with = content.with;
    }

    onContentChange(event: SyntheticEvent<any>) {
        this.content = event.currentTarget.value;
        this.save();
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

    onLocationChange(event: SyntheticEvent<any>) {
        this.location = event.currentTarget.value;
        this.save();
    }

    onMoodChange(event: SyntheticEvent<any>) {
        this.mood = event.currentTarget.value;
        this.save();
    }

    onOutfitChange(event: SyntheticEvent<any>) {
        this.outfit = event.currentTarget.value;
        this.save();
    }

    onPostChange(event: SyntheticEvent<any>) {
        this.postIndex = event.currentTarget.value;
        this.loadPost();
    }

    onPostDelete() {
        let post = this.posts[this.postIndex];
        if (this.posts.length == 1) {
            this.onPostNew();
        }
        else {
            this.postIndex = 0;
        }

        this.cookie.deletePost(post);
        let postIndex = this.posts.findIndex(p => p.name == post.name);
        if (postIndex != -1)
            this.posts.splice(postIndex, 1);
        this.loadPost();
    }

    onPostNameChange(event: SyntheticEvent<any>) {
        let name = event.currentTarget.value;
        if (name.indexOf('post: ') != 0)
            return;
        this.currentPostName = name;

        if (this.posts.findIndex(post => post.name == name) != -1)
            return;

        let post = this.posts[this.postIndex];
        this.cookie.deletePost(post);
        post.name = name;
        this.save();
    }

    onPostNew() {
        let name = 'post: ';
        let number = this.posts.length;
        while (this.posts.findIndex(post => post.name == name + number) != -1)
            number++;

        let content = {
            content: '',
            location: '',
            mood: '',
            outfit: '',
            with: ''
        };
        this.posts.unshift({name: name + number, content: content});
        this.postIndex = 0;
        this.loadPost();
        this.save();
    }

    onWithChange(event: SyntheticEvent<any>) {
        this.with = event.currentTarget.value;
        this.save();
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

    save() {
        this.posts[this.postIndex].content = {
            content: this.content,
            location: this.location,
            mood: this.mood,
            outfit: this.outfit,
            with: this.with
        };
        this.cookie.writeCookie(this.posts);
    }

    render() {
        return (
            <div className="cmp-make-post">
                <div className="post-selector">
                    <select onChange={this.onPostChange} value={this.postIndex}>
                        <For each="post" index="i" of={this.posts}>
                            <option key={i} value={i}>{post.name}</option>
                        </For>
                    </select>

                    <input type="text" onChange={this.onPostNameChange} value={this.currentPostName} />

                    <button onClick={this.onPostNew}>New Post</button>

                    <button onClick={this.onPostDelete}>Delete Post</button>
                </div>

                <div className="header">

                    <input
                        autoFocus={true}
                        onChange={this.onMoodChange}
                        placeholder="Mood"
                        type="text"
                        value={this.mood}
                    />
                    <input
                        onChange={this.onLocationChange}
                        placeholder="Location"
                        type="text"
                        value={this.location}
                    />
                    <input
                        onChange={this.onOutfitChange}
                        placeholder="Outfit"
                        type="text"
                        value={this.outfit}
                    />
                    <input
                        onChange={this.onWithChange}
                        placeholder="With"
                        type="text"
                        value={this.with}
                    />

                    <div className="content">
                        <textarea onChange={this.onContentChange} value={this.content} />
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

@autobind
class Cookie {
    posts = mobx.observable([]);

    constructor(cookie: string) {
        let postStrs = cookie.split(/;\s*/).filter(s => s.length && s.indexOf('post') == 0);
        postStrs.forEach(postStr => {
            let firstEqIndex = postStr.indexOf('=');
            let post = {
                content: JSON.parse(decodeURIComponent(postStr.substring(firstEqIndex+1))),
                name: decodeURIComponent(postStr.substring(0, firstEqIndex))
            };
            this.posts.unshift(post);
        });
    }

    deletePost(post) {
        document.cookie = `${encodeURIComponent(post.name)}=; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }

    writeCookie(posts) {
        let cookieStr = posts.map(post => `${encodeURIComponent(post.name)}=${encodeURIComponent(JSON.stringify(post.content))}`).join(';');
        document.cookie = cookieStr;
    }
}
