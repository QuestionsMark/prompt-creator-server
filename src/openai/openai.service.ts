import { Inject, Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { ResponseService } from "src/common/response/response.service";
import { FileService } from "src/file/file.service";
import { Openai, ServerSuccessfullResponse } from "src/types";
import { Prompt } from "./entities/prompt.entity";
import { FileItem } from "src/file/entities/file-item.entity";

@Injectable()
export class OpenAIService {
    private generatePromptSystem = `Znajdujesz się w sytuacji w której na podstawie tematu, który poda Ci użytkownik, masz pomóc mu w wygenerowaniu najlepszego opisowego promptu do sztucznej inteligencji generującej grafiki na podstawie podanej frazy.

    Twoim zadaniem będzie napisanie jak najlepszego opisowego promptu do generatora grafik DALL-E 3.

    Jesteś profesjonalnym, światowej klasy prompt inżynierem, który pisze rewelacyjne prompty.

    Twoim rozmówcą będzie osoba która chce otrzymać prompt do generatora grafik DALL-E 3, który będzie opisowy i dość długi.

    Na podstawie zdania, które poda Ci użytkownik wygeneruj długi opisowy, ale jak najbardziej precyzyjny prompt do generatora grafik DALL-E 3. Prompt ma być mocno opisowy, dzięki czemu każdy aspekt zostanie odpowiednio sprecyzowany. Każdy prompt napisz w języku angielskim, nawet jak użytkownik poda Ci temat w innym języku.

    Odpowiedz podając tylko wygenerowany przez ciebie opisowy prompt.`;
    private generateGenericPromptSystem = `Znajdujesz się w sytuacji w której na podstawie promptu, który poda Ci użytkownik, masz przeanalizować ten prompt i na jego podstawie wymyślić  zmienne pasujące do tego promptu.

    Twoim zadaniem będzie wymyślenie trafnych zmiennych, które dopasujesz do promptu, a następnie przeredagujesz prompt, który otrzymałeś, tak aby wprowadzić te zmienne.

    Jesteś profesjonalnym, światowej klasy prompt inżynierem, który przerabia zwykłe prompty na generyczne prompty ze zmiennymi.

    Twoim rozmówcą będzie osoba która tworzy prompt do generatora grafik DALL-E 3 i chce przerobić ten prompt na prompt ze zmiennymi.

    Na podstawie promptu, który poda Ci użytkownik wymyśl do niego pasujące zmienne i przepisz otrzymany prompt, tak aby zawierał on wymyślone przez Ciebie zmienne. Zmienne mogą dotyczyć stylu, kolorystyki, tematu, świata, emocji, pozycji, stanu, rozmiaru itp.. Zmienne będziesz oznaczać nazwą zmiennej w kwadratowych nawiasach. Nazwy zmiennych mają być w języku angielskim i krótko i zwięźle opisywać co się pod nimi kryje. Zmiennych nie ma być dużo, a nawet powiedziałbym że bardzo mało, ale mają być sensowne i dobrze dopasowane.

    Odpowiedz podając tylko przepisany prompt użytkownika zamieszczając w nim nie wypełnione zmienne.`;
    private fillVariablesSystem = `Znajdujesz się w sytuacji w której na podstawie generycznego promptu ze zmiennymi, który poda Ci użytkownik, masz przeanalizować ten prompt i wypełnić zmienne.

    Twoim zadaniem będzie sensowne wypełnienie zmiennych, które znajdują się w prompcie od użytkownika, tak aby były dobrze dopasowane do całego promptu.

    Jesteś profesjonalnym, światowej klasy prompt inżynierem, który wypełnia generyczne prompty ze zmiennymi oznaczonymi kwadratowymi nawiasami, tak aby powstał spójny, zrozumiały i opisowy prompt.

    Twoim rozmówcą będzie osoba która tworzy generyczne prompty ze zmiennymi oznaczonymi kwadratowymi nawiasami do generatora grafik DALL-E 3 i chce wypełnić ten prompt przykładowymi, sensownymi słowami.

    Na podstawie promptu, który poda Ci użytkownik wypełnij go dobrze dopasowanymi słowami, tak aby pasowały do zmiennych i całości promptu. Wypełniając zmienne pozbądź się kwadratowych nawiasów, żeby stworzyć ładny i opisowy prompt. Zmienne wypełnij w języku angielskim.

    Odpowiedz podając tylko wypełniony prompt użytkownika pozbywając się kwadratowych nawiasów.`;
    private generateVariablesExamplesSystem = `Znajdujesz się w sytuacji w której na podstawie generycznego promptu ze zmiennymi, który poda Ci użytkownik, masz przeanalizować ten prompt i znaleźć wszystkie zmienne i podać kilka przykładowych wypełnień tych zmiennych.

    Twoim zadaniem będzie znalezienie zmiennych w prompcie, który dostaniesz od użytkownika, a nastepnie podanie kilku sensownych przykładów zmiennych, tak aby były dobrze dopasowane do całego promptu.
    
    Jesteś profesjonalnym, światowej klasy prompt inżynierem, który znajduje zmienne w prompcie oznaczone kwadratowymi nawiasami i podaje kilka sensownych przykładów dla tych zmiennych 
    
    Twoim rozmówcą będzie osoba która tworzy generyczne prompty ze zmiennymi oznaczonymi kwadratowymi nawiasami do generatora grafik DALL-E 3 i chce otrzymać zmienne znajdujące się w tym prompcie oraz kilka przykładowych sensownych wypełnień dla tych zmiennych.
    
    Na podstawie promptu, który poda Ci użytkownik znajdź wszystkie zmienne nie zmieniając ich nazw, a następnie wymyśl do każdej z nich po kilka sensownych przykładów. Przykłady podaj w języku angielskim.
    
    Odpowiedz zawsze taką strukturą JSON:
    '''
    {
        variableName: string;
        examples: string[];
    }[]
    '''`;

    private generateDescriptionSystem = `Znajdujesz się w sytuacji w której na podstawie promptu, który poda Ci użytkownik, masz przeanalizować ten prompt i napisać do niego bardzo krótki opis.

    Twoim zadaniem będzie napisanie bardzo krótkiego opisu na platformę, na której wystawia się swoje prompty na sprzedaż, w którym krótko i zwięźle opiszesz co można uzyskać używając prompta, który poda użytkownik.
    
    Jesteś profesjonalnym, światowej klasy marketingowcem, który wie jak ma sprzedać swój produkt.
    
    Twoim rozmówcą będzie osoba która tworzy prompty do generatora grafik DALL-E 3 i chce otrzymać bardzo krótki opis do swojego prompta, który będzie mógł zamieścić na platformie do sprzedaży promptów.
    
    Na podstawie promptu, który poda Ci użytkownik napisz fajny wyrafinowany, ale bardzo krótki opis, w którym krótko i zwięźle przedstawisz co oferuje prompt. Napisz opis w języku angielskim.
    
    
    Odpowiedz podając tylko opis do promptu.`;

    constructor(
        @Inject(ResponseService) private responseService: ResponseService,
        @Inject(FileService) private fileService: FileService,
    ) { }

    private parameters: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
        messages: [],
        model: 'gpt-3.5-turbo-16k-0613',
        n: 1,
        top_p: 0.5,
        temperature: 0.7,
        stream: false,
    };

    extractFirstChoice(choices: OpenAI.Chat.Completions.ChatCompletion.Choice[]): Openai.ChatResponse {
        const firstChoice = choices?.[0].message;

        if (!firstChoice) return null;

        return {
            content: firstChoice?.content ?? null,
        };
    }

    async say(openai: OpenAI, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], prompt: string): Promise<Openai.ChatResponse> {
        messages.push({
            role: 'user',
            content: prompt,
        });

        const { choices } = await openai.chat.completions.create({
            ...this.parameters,
            messages,
        })

        const response = this.extractFirstChoice(choices);

        if (response?.content) {
            messages.push({
                role: 'assistant',
                content: response.content,
            });
        }

        return response;
    }

    async generateImage(apiKey: string, prompt: string): Promise<ServerSuccessfullResponse<string>> {
        const openai = new OpenAI({
            apiKey,
        });
        const image = await openai.images.generate({
            prompt,
            model: 'dall-e-3',
            n: 1,
            response_format: 'b64_json',
            style: 'vivid',
            quality: "hd",
        });

        const base64 = image.data[0].b64_json;
        if (!base64) throw new Error('No generated avatar.');

        const filename = await this.fileService.saveFile(base64);

        const file = new FileItem();
        file.filename = filename;
        await file.save();

        return this.responseService.sendSuccessfullResponse('Image generated.');
    }

    async generateGenericPrompt(apiKey: string, prompt: string): Promise<ServerSuccessfullResponse<Openai.CreatePromptResponse>> {
        const openai = new OpenAI({
            apiKey,
        });
        const generatePromptMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: this.generatePromptSystem,
            },
        ];
        const descriptivePrompt = await this.say(openai, generatePromptMessages, prompt);
        if (!descriptivePrompt || !descriptivePrompt?.content) throw new Error();

        const generateGenericPromptMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: this.generateGenericPromptSystem,
            }
        ];
        const genericPrompt = await this.say(openai, generateGenericPromptMessages, descriptivePrompt?.content || '');
        if (!genericPrompt || !genericPrompt?.content) throw new Error();

        const fillVariablesMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: this.fillVariablesSystem,
            }
        ];
        const examplePrompt = await this.say(openai, fillVariablesMessages, genericPrompt?.content || '');
        if (!examplePrompt || !examplePrompt?.content) throw new Error();

        const newPrompt = new Prompt();
        newPrompt.descriptivePrompt = descriptivePrompt?.content || '';
        newPrompt.examplePrompt = examplePrompt?.content || '';
        newPrompt.genericPrompt = genericPrompt?.content || '';
        newPrompt.originalPrompt = prompt;
        const savedPrompt = await newPrompt.save();

        return this.responseService.sendSuccessfullResponse({
            descriptivePrompt: savedPrompt.descriptivePrompt,
            examplePrompt: savedPrompt.examplePrompt,
            genericPrompt: savedPrompt.genericPrompt,
            originalPrompt: prompt,
            createdAt: savedPrompt.createdAt,
            id: savedPrompt.id,
        });
    }

    async refillVariables(apiKey: string, prompt: string): Promise<ServerSuccessfullResponse<string>> {
        const openai = new OpenAI({
            apiKey,
        });
        const fillVariablesMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: this.fillVariablesSystem,
            }
        ];
        const examplePrompt = await this.say(openai, fillVariablesMessages, prompt);
        if (!examplePrompt || !examplePrompt?.content) throw new Error();
        return this.responseService.sendSuccessfullResponse(examplePrompt?.content || '');
    }

    async generateDescription(apiKey: string, prompt: string): Promise<ServerSuccessfullResponse<string>> {
        const openai = new OpenAI({
            apiKey,
        });
        const generateDescriptionMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: this.generateDescriptionSystem,
            }
        ];
        const description = await this.say(openai, generateDescriptionMessages, prompt);
        if (!description || !description?.content) throw new Error();
        return this.responseService.sendSuccessfullResponse(description?.content || '');
    }

    async generateVariablesExamples(apiKey: string, prompt: string): Promise<ServerSuccessfullResponse<Openai.VariableExample[]>> {
        const validation = (json: string): boolean => {
            try {
                const arr: Openai.VariableExample[] = JSON.parse(json);

                let validation: boolean = true;

                arr.forEach(e => {
                    if (
                        !e.hasOwnProperty('variableName') ||
                        !e.hasOwnProperty('examples') ||
                        typeof e.variableName !== 'string' ||
                        !(e.examples instanceof Array) ||
                        e.examples.find(e => typeof e !== 'string')
                    ) {
                        validation = false;
                    }
                });

                return validation;
            } catch (error) {
                return false;
            }
        };

        const openai = new OpenAI({
            apiKey,
        });

        let variablesExamplesJSON = '';
        do {
            const generateVariablesExamplesMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                {
                    role: 'system',
                    content: this.generateVariablesExamplesSystem,
                }
            ];

            const variablesExamples = await this.say(openai, generateVariablesExamplesMessages, prompt);
            if (!variablesExamples || !variablesExamples?.content) throw new Error();
            variablesExamplesJSON = variablesExamples.content;

        } while (!validation(variablesExamplesJSON))
        return this.responseService.sendSuccessfullResponse(JSON.parse(variablesExamplesJSON));
    }

    async getPrompts(page: number, limit: number): Promise<ServerSuccessfullResponse<Openai.CreatePromptResponse[]>> {
        const [images, count] = await Prompt.findAndCount({
            skip: this.responseService.skip(page, limit),
            take: this.responseService.limit(limit),
            order: {
                createdAt: "DESC",
            },
            select: ['createdAt', 'id', 'descriptivePrompt', 'examplePrompt', 'genericPrompt', 'originalPrompt'],
        });

        return this.responseService.sendSuccessfullResponse(images, count);
    }
}