import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-common',
  imports: [RouterOutlet], 
  templateUrl: './common.html',
  styleUrl: './common.scss',
})
export class Common {}