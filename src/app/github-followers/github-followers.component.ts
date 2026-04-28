import { ActivatedRoute } from '@angular/router';
import { GithubFollowersService } from './../services/github-followers.service';
import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GitHubFollower } from '../models/github.model';

@Component({
  standalone: false,
  selector: 'app-github-followers',
  templateUrl: './github-followers.component.html',
  styleUrls: ['./github-followers.component.css']
})
export class GithubFollowersComponent implements OnInit {
  followers: GitHubFollower[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private service: GithubFollowersService) { }

  ngOnInit(): void {
    this.isLoading = true;

    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap
    ]).pipe(
      switchMap(() => this.service.getAll<GitHubFollower>())
    ).subscribe({
      next: (followers) => {
        this.followers = followers;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load followers';
        this.isLoading = false;
        console.error('Error loading followers:', err);
      }
    });
  }
}
