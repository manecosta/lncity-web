import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { BlogService } from 'src/app/services/blog.service';

import * as moment from 'moment';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { PaymentDialogComponent } from 'src/app/dialogs/paymentdialog/paymentdialog.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
    selector: 'app-blog',
    templateUrl: 'blog.component.html',
    styleUrls: ['blog.component.less']
})
export class BlogComponent implements OnInit {
    page = 1;
    count = 10;
    total = 10;

    pageCount = 0;

    pagePosts = [];

    loading = true;

    MAX_COMMENT_LENGTH = 500;
    addingComment = false;

    constructor(
        public appService: AppService,
        private blogService: BlogService,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.loading = true;
        this.route.paramMap.subscribe((route: ParamMap) => {
            const postId = route.get('postId');
            if (postId) {
                this.blogService
                    .getBlogPost(postId)
                    .then(result => {
                        this.pagePosts = [result];
                        this.total = 1;
                        this.loading = false;
                    })
                    .catch(error => {
                        this.router.navigate(['blog']);
                    });
            } else {
                this.retrievePostList();
            }
        });
    }

    retrievePostList() {
        this.blogService.getBlogPosts(1, 10).then(result => {
            this.total = result.total;
            this.pagePosts = result.posts;
            this.loading = false;
        });
    }

    // Tips

    tipPost(post) {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            message: 'Select an amount to tip (satoshi):',
            target: 'blogpost/' + post.id
        };

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );

        paymentDialog.afterClosed().subscribe(result => {
            if (result) {
                post.donation_count += 1;
                post.donation_amount += result.amount;
            }
        });
    }

    tipComment(comment) {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            message: 'Select an amount to tip (satoshi):',
            target: 'blogpostcomment/' + comment.id
        };

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );

        paymentDialog.afterClosed().subscribe(result => {
            if (result) {
                comment.donation_count += 1;
                comment.donation_amount += result.amount;
            }
        });
    }

    // Comments

    loadPostComments(post) {
        if (!post.comments_loaded && !post.comments_loading) {
            if (post.comments_count > 0) {
                post.comments_loading = true;
                this.blogService
                    .getBlogPostComments(post.id, 1, 1000)
                    .then(result => {
                        post.comments_loading = false;
                        post.comments_loaded = true;
                        post.comments = result.comments;
                    });
            } else {
                post.comments_loaded = true;
                post.comments = [];
            }
        } else if (post.comments_loaded) {
            post.comments_loaded = false;
            post.comments = [];
        }
    }

    addComment(event, post) {
        const comment = event.target.value;
        if (comment.length > 0 && comment.length <= 500) {
            this.addingComment = true;
            this.blogService
                .addBlogPostComment(post.id, comment)
                .then(response => {
                    post.comments = [response].concat(post.comments || []);
                    post.comments_count = 1 + (post.comments_count || 0);
                    this.addingComment = false;
                    event.target.value = '';
                })
                .catch(error => {
                    this.addingComment = false;
                });
        }
    }

    // UI Helpers

    readableDate(timestamp) {
        return moment(timestamp * 1000).fromNow();
    }

    getUserName(user) {
        if (user.username) {
            return user.username;
        } else {
            return 'anonymous';
        }
    }
}
