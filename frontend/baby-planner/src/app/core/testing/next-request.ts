import { HttpRequest } from '@angular/common/http';
import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

/**
 * Asteapta pana apare o cerere care se potriveste si o intoarce, ca testul sa-i raspunda.
 *
 * O cerere pornita dintr-o resursa (dupa ce alta cerere s-a rezolvat) sau dintr-o
 * navigare (filtru, Back) apare abia dupa cateva task-uri. `whenStable` nu ajuta
 * aici: ar astepta tocmai cererea asta, pe care n-a rezolvat-o nimeni.
 */
export async function nextRequest(
  httpMock: HttpTestingController,
  match: string | ((request: HttpRequest<unknown>) => boolean),
): Promise<TestRequest> {
  const matches =
    typeof match === 'string' ? (request: HttpRequest<unknown>) => request.url === match : match;
  for (let attempt = 0; attempt < 50; attempt++) {
    TestBed.tick();
    const requests = httpMock.match(matches);
    if (requests.length > 1) {
      throw new Error(`Expected one request, found ${requests.length}: ${requests[0].request.url}`);
    }
    if (requests.length === 1) {
      return requests[0];
    }
    await new Promise((resolve) => setTimeout(resolve));
  }
  throw new Error(`No matching request${typeof match === 'string' ? ` for ${match}` : ''}`);
}
