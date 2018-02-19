import { AppError } from './../common/app-error';
import { PostsService } from './../services/posts.service';
import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { NotFoundError } from '../common/not-found-error';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})

export class PostsComponent implements OnInit {
  posts: any[];
  constructor(private service: PostsService) { }

  ngOnInit() {
    this.service.getAll()
      .subscribe(posts => this.posts = posts);
  }

  createPosts(input: HTMLInputElement) {
    const post = {title: input.value};
    this.posts.splice(0, 0, post);

    input.value = '';

    this.service.create(JSON.stringify(post))
      .subscribe(
        newPost => {
          post['id'] = newPost.id;
        },
        (error: AppError) => {
          this.posts.splice(0, 1);

          if (error instanceof NotFoundError) {
            console.log(error.originalError);
          }
          // tslint:disable-next-line:one-line
          else {
            throw error;
          }
        });
  }

  updatePost(post) {
    this.service.update(post)
      .subscribe(
        updatedPost => {
          this.posts.splice(0, 0, updatedPost);
        });
  }

  deletePost(post) {
    const index = this.posts.indexOf(post);
    this.posts.splice(index, 1);

    this.service.delete(post.id)
      .subscribe(
        null,
        (error: AppError) => {
          this.posts.splice(index, 0, post);

          if (error instanceof NotFoundError) {
            alert('This post has already been deleted');
          }
          // tslint:disable-next-line:one-line
          else {
            throw error;
          }
        });
  }

}
