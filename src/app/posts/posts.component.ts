import { AppError } from './../common/app-error';
import { PostsService } from './../services/posts.service';
import { Component, OnInit } from '@angular/core';
import { NotFoundError } from '../common/not-found-error';

interface Post {
  id?: number;
  title: string;
}

@Component({
  standalone: false,
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})

export class PostsComponent implements OnInit {
  posts: Post[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private service: PostsService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.service.getAll<Post>()
      .subscribe({
        next: posts => {
          this.posts = posts;
          this.isLoading = false;
        },
        error: (err: AppError) => {
          this.errorMessage = 'Failed to load posts';
          this.isLoading = false;
          console.error('Error loading posts:', err);
        }
      });
  }

  createPosts(input: HTMLInputElement): void {
    const post: Post = { title: input.value };
    this.posts.splice(0, 0, post);

    input.value = '';

    this.service.create<Post>(post)
      .subscribe({
        next: (newPost) => {
          if (newPost && newPost.id) {
            post.id = newPost.id;
          }
        },
        error: (error: AppError) => {
          this.posts.splice(0, 1);

          if (error instanceof NotFoundError) {
            console.error(error.originalError);
          } else {
            throw error;
          }
        }
      });
  }

  updatePost(post: Post): void {
    if (!post.id) return;

    this.service.update<Post>(post as Post & { id: number })
      .subscribe({
        next: (updatedPost) => {
          this.posts.splice(0, 0, updatedPost);
        },
        error: (err: AppError) => {
          console.error('Error updating post:', err);
        }
      });
  }

  deletePost(post: Post): void {
    if (!post.id) return;

    const index = this.posts.indexOf(post);
    this.posts.splice(index, 1);

    this.service.delete<Post>(post.id)
      .subscribe({
        next: () => {},
        error: (error: AppError) => {
          this.posts.splice(index, 0, post);

          if (error instanceof NotFoundError) {
            alert('This post has already been deleted');
          } else {
            throw error;
          }
        }
      });
  }
}

