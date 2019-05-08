import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable()
export class BlogService {
    static instance: BlogService;

    constructor(private requestService: RequestService) {
        BlogService.instance = this;
    }

    getTags() {
        return this.requestService.get('/tags/get');
    }

    getBlogPost(blogPostId) {
        return this.requestService.get('/blogs/1/posts/' + blogPostId);
    }

    getBlogPosts(page, count, tag?) {
        if (tag) {
            return this.requestService.get(
                '/blogs/1/posts/' + page + '/' + count + '/tags/' + tag
            );
        } else {
            return this.requestService.get(
                '/blogs/1/posts/' + page + '/' + count
            );
        }
    }

    getBlogPostComments(blogPostId, page, count) {
        return this.requestService.get(
            '/blogs/1/posts/' + blogPostId + '/comments/' + page + '/' + count
        );
    }

    addBlogPostComment(blogPostId, body) {
        return this.requestService.post(
            '/blogs/1/posts/' + blogPostId + '/comments',
            {
                body
            }
        );
    }
}
