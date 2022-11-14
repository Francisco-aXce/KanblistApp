import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'takeNWord'
})
export class TakeNWordPipe implements PipeTransform {

  transform(words: string, n: number): string {
    const splitedWords = words.split(' ');
    if (n > splitedWords.length - 1) return words;

    return splitedWords[n];
  }

}
