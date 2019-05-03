import { Component, OnInit } from '@angular/core';
import { BlogService } from 'src/app/services/blog.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.less']
})
export class HomeComponent implements OnInit {
    games = [
        {
            title: 'Slot',
            description:
                'Play the lightning slots and earn up to 40x your bet!',
            navigate: 'slot',
            background: 'assets/img/slot/promobg.png'
        },
        {
            title: 'Roulette',
            description:
                'Play the lightning roulette and earn up to 36x your bet!',
            navigate: 'roulette',
            background: 'assets/img/roulette/promobg.png'
        }
    ];

    loadingBlogPosts = true;
    blogPosts = [];

    constructor(private blogService: BlogService) {}

    ngOnInit() {
        this.blogService.getBlogPosts(1, 4).then(blogPostsResponse => {
            this.blogPosts = blogPostsResponse.posts;
            this.loadingBlogPosts = false;
        });
    }

    getBlogPostPreview(blogPost) {
        let body: string = blogPost.body.replace(/<[^>]+>/g, '');
        body = body.slice(0, 100) + '...';
        return body;
    }
}
